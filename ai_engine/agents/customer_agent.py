import os
import datetime
import psycopg2
from contextlib import contextmanager
from psycopg2.extras import RealDictCursor
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import create_react_agent

KNOWLEDGE_PATH = "/app/data/salon_knowledge.txt"


# ─────────────────────────────────────────
# DATABASE HELPER  (context-manager safe)
# ─────────────────────────────────────────
@contextmanager
def get_db_connection():
    """Yields a psycopg2 connection and guarantees it is closed on exit."""
    conn = psycopg2.connect(
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        host=os.getenv("DB_HOST", "db"),
        port=os.getenv("DB_PORT", "5432"),
    )
    try:
        yield conn
    finally:
        conn.close()


# ─────────────────────────────────────────
# TOOL 1 — Active Services
# ─────────────────────────────────────────
@tool
def get_active_services() -> list:
    """Fetches a list of all active salon services, their IDs, prices, durations, and categories."""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id, name, price, duration_minutes, category_id "
                    "FROM services_service WHERE is_active = true;"
                )
                return cur.fetchall()
    except Exception as e:
        return [{"error": f"Error fetching services: {str(e)}"}]


# ─────────────────────────────────────────
# TOOL 2 — Staff Availability (duration-aware)
# ─────────────────────────────────────────
@tool
def check_staff_availability(date_str: str) -> list:
    """Checks the availability of staff members for a specific date (YYYY-MM-DD format).
    Returns available staff IDs and their unbooked time slots, accounting for actual
    booking durations rather than a fixed 1-hour assumption."""
    try:
        query_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        today = datetime.date.today()
        if query_date < today:
            return [{"error": "Cannot check availability for past dates."}]

        weekday = query_date.weekday()  # 0 = Monday, 6 = Sunday

        # Determine operating hours based on salon_knowledge.txt
        if weekday in [0, 1, 2]:       # Mon–Wed
            open_hour, close_hour = 9, 19
        elif weekday in [3, 4]:        # Thu–Fri
            open_hour, close_hour = 9, 20
        elif weekday == 5:             # Sat
            open_hour, close_hour = 8, 17
        else:                          # Sunday
            return [{"message": "The salon is closed on Sundays."}]

        # Generate all possible 1-hour slot starts
        possible_slots = []
        for h in range(open_hour, close_hour):
            possible_slots.append(datetime.time(hour=h, minute=0))

        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Fetch staff
                cur.execute(
                    """
                    SELECT u.id, u.username, u.email, p.job_title
                    FROM accounts_user u
                    JOIN accounts_employeeprofile p ON u.id = p.user_id
                    WHERE p.is_available = true;
                    """
                )
                staff_members = cur.fetchall()

                # Fetch bookings WITH actual total duration from services
                cur.execute(
                    """
                    SELECT b.employee_id,
                           b.booking_time,
                           COALESCE(SUM(s.duration_minutes), 60) AS total_duration
                    FROM bookings_booking b
                    LEFT JOIN bookings_bookingitem bi ON bi.booking_id = b.id
                    LEFT JOIN services_service s      ON s.id = bi.service_id
                    WHERE b.booking_date = %s AND b.status != 'CANCELLED'
                    GROUP BY b.id, b.employee_id, b.booking_time;
                    """,
                    (query_date,),
                )
                bookings = cur.fetchall()

        # Build a per-employee set of blocked slot-hours
        staff_blocked: dict[int, set[str]] = {}
        for b in bookings:
            emp_id = b["employee_id"]
            if emp_id not in staff_blocked:
                staff_blocked[emp_id] = set()

            # booking_time is a Python datetime.time object
            start_dt = datetime.datetime.combine(query_date, b["booking_time"])
            duration = int(b["total_duration"])

            # Mark every slot-hour that overlaps with [start, start+duration)
            for slot in possible_slots:
                slot_dt = datetime.datetime.combine(query_date, slot)
                slot_end = slot_dt + datetime.timedelta(hours=1)
                booking_end = start_dt + datetime.timedelta(minutes=duration)

                # Two ranges overlap when start1 < end2 AND start2 < end1
                if start_dt < slot_end and slot_dt < booking_end:
                    staff_blocked[emp_id].add(slot.strftime("%I:%M %p"))

        # Build the availability list
        availability = []
        now_time = datetime.datetime.now().time()

        for s in staff_members:
            staff_id = s["id"]
            name = s.get("username") or s.get("email") or f"Stylist {staff_id}"

            blocked = staff_blocked.get(staff_id, set())
            free_slots = [
                t.strftime("%I:%M %p")
                for t in possible_slots
                if t.strftime("%I:%M %p") not in blocked
            ]

            # If checking today, drop slots that have already passed
            if query_date == today:
                free_slots = [
                    slot for slot in free_slots
                    if datetime.datetime.strptime(slot, "%I:%M %p").time() > now_time
                ]

            if free_slots:
                availability.append({
                    "staff_id": staff_id,
                    "name": name,
                    "available_slots": free_slots,
                })

        return availability if availability else [
            {"message": "No staff members have any available slots on this date."}
        ]
    except Exception as e:
        print(f"DEBUG STAFF AVAIL: {str(e)}")
        return [{"error": f"Error fetching staff availability: {str(e)}"}]


# ─────────────────────────────────────────
# KNOWLEDGE LOADER
# ─────────────────────────────────────────
def load_salon_knowledge() -> str:
    """Loads the salon knowledge text file for context injection."""
    try:
        if os.path.exists(KNOWLEDGE_PATH):
            with open(KNOWLEDGE_PATH, "r") as f:
                return f.read()
    except Exception:
        pass
    return "No static knowledge provided."


# ─────────────────────────────────────────
# CUSTOMER AGENT ENTRY POINT
# ─────────────────────────────────────────
def ask_customer_agent(query: str) -> str:
    """Answers a public user query using an Enterprise Secure Tool-Calling Agent."""
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return "API Key not configured."

        # 1. Initialize Groq LLM
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=api_key,
            temperature=0.2  # Low temperature for reliable tool calling and factual responses
        )

        # 2. Define our safe tools
        tools = [get_active_services, check_staff_availability]

        # 3. Load static knowledge and current date
        salon_knowledge = load_salon_knowledge()
        today_date = datetime.date.today().isoformat()

        # 4. Construct the System Prompt with strict guidelines
        system_prompt = f"""You are a friendly, professional AI receptionist for the 'Hair Ways' salon.
Your job is to help customers with questions about services, styles, pricing, staff availability, and policies.

CRITICAL RULES:
1. For policies, hours, or general salon info, rely EXCLUSIVELY on the SALON KNOWLEDGE provided below. Do not invent rules.
2. For services and prices, use the `get_active_services` tool.
3. For staff availability and booking schedules, use the `check_staff_availability` tool.
4. When a user explicitly agrees to book or you are ready to propose a booking action, you MUST output a markdown Call-To-Action link in this EXACT format:
   [Book Now](/book?service=ServiceID&staff=StaffID&date=YYYY-MM-DD&time=HH:MM)
   (Replace ServiceID, StaffID, date, and time. Example: /book?service=1&staff=4&date=2026-02-25&time=10:30. Do not use this if IDs or time are unknown).
5. Do NOT invent prices, services, or staff members. Only report what the tools provide.
6. Present information in a warm, customer-friendly way.

TODAY's DATE: {today_date}

=== SALON KNOWLEDGE (Static Policies & Contact) ===
{salon_knowledge}
=================================================
"""

        # 5. Create the modern LangGraph React Agent
        agent = create_react_agent(llm, tools)

        # 6. Execute! We pass the SystemMessage explicitly in the messages list.
        response = agent.invoke({"messages": [SystemMessage(content=system_prompt), ("human", query)]})

        # The response is a dictionary containing the message history.
        return response["messages"][-1].content

    except Exception as e:
        print(f"Error in Customer Hybrid Agent: {e}")
        return "Our AI assistant is temporarily unavailable. Please try again later."
