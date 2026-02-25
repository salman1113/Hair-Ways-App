import os
import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import create_react_agent

KNOWLEDGE_PATH = "/app/data/salon_knowledge.txt"

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "salman1113")
    db_name = os.getenv("DB_NAME", "saloon_db")
    db_host = os.getenv("DB_HOST", "db")
    db_port = os.getenv("DB_PORT", "5432")
    
    return psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=db_password,
        host=db_host,
        port=db_port
    )

@tool
def get_active_services() -> list:
    """Fetches a list of all active salon services, their IDs, prices, durations, and categories."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # Fetching safe, read-only data from the services table
        cur.execute("SELECT id, name, price, duration_minutes, category_id FROM services_service WHERE is_active = true;")
        services = cur.fetchall()
        cur.close()
        conn.close()
        return services
    except Exception as e:
        return [{"error": f"Error fetching services: {str(e)}"}]

@tool
def check_staff_availability(date_str: str) -> list:
    """Checks the availability of staff members for a specific date (YYYY-MM-DD format). Returns available staff IDs and their unbooked time slots."""
    try:
        query_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        today = datetime.date.today()
        if query_date < today:
            return [{"error": "Cannot check availability for past dates."}]
            
        weekday = query_date.weekday() # 0 = Monday, 6 = Sunday
        
        # Determine operating hours based on salon_knowledge.txt
        if weekday in [0, 1, 2]: # Mon-Wed
            open_hour, close_hour = 9, 19
        elif weekday in [3, 4]: # Thu-Fri
            open_hour, close_hour = 9, 20
        elif weekday == 5: # Sat
            open_hour, close_hour = 8, 17
        else: # Sunday
            return [{"message": "The salon is closed on Sundays."}]
            
        # Generate all possible 1-hour slots based on operating hours
        possible_slots = []
        for h in range(open_hour, close_hour):
            t = datetime.time(hour=h, minute=0)
            possible_slots.append(t.strftime("%I:%M %p"))

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Safely query the explicit custom accounts_user table joined with employee profile 
        # to ensure we only get valid active staff members.
        cur.execute(
            """
            SELECT u.id, u.username, u.email, p.job_title 
            FROM accounts_user u
            JOIN accounts_employeeprofile p ON u.id = p.user_id
            WHERE p.is_available = true;
            """
        )
        staff_members = cur.fetchall()
        
        # Safely query 'bookings_booking' to find taken time slots for the specific date
        cur.execute(
            """
            SELECT employee_id, booking_time 
            FROM bookings_booking 
            WHERE booking_date = %s AND status != 'CANCELLED';
            """,
            (query_date,)
        )
        bookings = cur.fetchall()
        
        cur.close()
        conn.close()
        
        # Group booked times by staff ID
        staff_bookings = {}
        for b in bookings:
            emp_id = b['employee_id']
            if emp_id not in staff_bookings:
                staff_bookings[emp_id] = set()
            # booking_time is a Python datetime.time object
            staff_bookings[emp_id].add(b['booking_time'].strftime("%I:%M %p"))
            
        availability = []
        for s in staff_members:
            staff_id = s['id']
            # Using username, falling back to email or generic "Stylist"
            name = s.get('username') or s.get('email') or f"Stylist {staff_id}"
            
            # Find which possible slots are NOT in the booked slots
            booked_slots = staff_bookings.get(staff_id, set())
            free_slots = [slot for slot in possible_slots if slot not in booked_slots]
            
            # If checking today, physically filter out slots that have already passed in reality
            if query_date == today:
                current_time = datetime.datetime.now().time()
                valid_free_slots = []
                for slot in free_slots:
                    slot_time = datetime.datetime.strptime(slot, "%I:%M %p").time()
                    if slot_time > current_time:
                        valid_free_slots.append(slot)
                free_slots = valid_free_slots

            if free_slots:
                availability.append({
                    "staff_id": staff_id, 
                    "name": name, 
                    "available_slots": free_slots
                })
                
        return availability if availability else [{"message": "No staff members have any available slots on this date."}]
    except Exception as e:
        print(f"DEBUG STAFF AVAIL: {str(e)}")
        return [{"error": f"Error fetching staff availability: {str(e)}"}]

def load_salon_knowledge() -> str:
    """Loads the salon knowledge text file for context injection."""
    try:
        if os.path.exists(KNOWLEDGE_PATH):
            with open(KNOWLEDGE_PATH, "r") as f:
                return f.read()
    except Exception:
        pass
    return "No static knowledge provided."

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
            temperature=0.2 # Low temperature for reliable tool calling and factual responses
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
        # Passing no kwargs for system prompt to ensure cross-version compatibility
        agent = create_react_agent(llm, tools)

        # 6. Execute! We pass the SystemMessage explicitly in the messages list.
        response = agent.invoke({"messages": [SystemMessage(content=system_prompt), ("human", query)]})
        
        # The response is a dictionary containing the message history.
        return response["messages"][-1].content
        
    except Exception as e:
        print(f"Error in Customer Hybrid Agent: {e}")
        return "Our AI assistant is temporarily unavailable. Please try again later."
