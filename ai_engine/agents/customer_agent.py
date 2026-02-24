import os
from langchain_groq import ChatGroq
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent

KNOWLEDGE_PATH = "/app/data/salon_knowledge.txt"

def load_salon_knowledge() -> str:
    """Loads the salon knowledge text file for context injection."""
    try:
        if os.path.exists(KNOWLEDGE_PATH):
            with open(KNOWLEDGE_PATH, "r") as f:
                return f.read()
    except Exception:
        pass
    return ""

def ask_customer_agent(query: str) -> str:
    """Answers a public user query using a SQL Agent with salon knowledge context."""
    try:
        # 1. Initialize SQL Database (restricted to service tables only)
        db_user = os.getenv("DB_USER", "postgres")
        db_password = os.getenv("DB_PASSWORD", "salman1113")
        db_name = os.getenv("DB_NAME", "saloon_db")
        db_host = os.getenv("DB_HOST", "db")
        db_port = os.getenv("DB_PORT", "5432")
        db_uri = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        
        # Restrict to only service/category tables for security
        db = SQLDatabase.from_uri(db_uri, include_tables=["services_service", "services_category"])

        # 2. Initialize Groq LLM
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return "API Key not configured."
            
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=api_key,
            temperature=0.3
        )

        # 3. Create the SQL Agent (same proven approach as admin_agent)
        agent_executor = create_sql_agent(
            llm=llm,
            db=db,
            agent_type="tool-calling",
            agent_executor_kwargs={
                "handle_parsing_errors": True
            }
        )

        # 4. Load salon knowledge for context
        salon_knowledge = load_salon_knowledge()

        # 5. Build the full prompt with system instructions + knowledge context
        prefix = (
            "You are a friendly, professional AI receptionist for the 'Hair Ways' salon. "
            "Your job is to help customers with questions about services, styles, pricing, and policies.\n\n"
            "CRITICAL RULES:\n"
            "1. NEVER execute DML commands (INSERT, UPDATE, DELETE, DROP). Only use SELECT.\n"
            "2. If the customer asks about available services, styles, or prices, ALWAYS query the database to get real data.\n"
            "3. If the customer asks about policies, hours, or general salon info, use the knowledge context below.\n"
            "4. Do NOT invent prices or services. Only report what exists in the database.\n"
            "5. Present information in a warm, customer-friendly way.\n"
            "6. If you do not know the answer, politely recommend calling the salon directly.\n\n"
        )

        if salon_knowledge:
            prefix += f"SALON KNOWLEDGE (for policies and general info):\n{salon_knowledge}\n\n"

        prefix += f"Customer Question: {query}"
        
        response = agent_executor.invoke({"input": prefix})
        return response.get("output", "I'm sorry, I couldn't process your request.")
    except Exception as e:
        print(f"Error in Customer Hybrid Agent: {e}")
        return "Our AI assistant is temporarily unavailable. Please try again later."
