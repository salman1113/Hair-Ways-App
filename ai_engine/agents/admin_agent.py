import os
from langchain_groq import ChatGroq
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent

# Initialize the Admin SQL Database Agent using Gemini
def get_admin_agent():
    # Construct postgres connection string using environment variables
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "postgres")
    db_name = os.getenv("DB_NAME", "hairways_db")
    db_host = os.getenv("DB_HOST", "db")  # Docker network hostname
    db_port = os.getenv("DB_PORT", "5432")

    db_uri = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    # Connect to the database
    db = SQLDatabase.from_uri(db_uri)

    # Initialize Groq LLM
    api_key = os.getenv("GROQ_API_KEY")
        
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=api_key,
        temperature=0
    )

    # Create the SQL Agent
    agent_executor = create_sql_agent(
        llm=llm,
        db=db,
        agent_type="tool-calling",
        # Instructions to ensure it behaves safely and effectively for Hair Ways admins
        agent_executor_kwargs={
            "handle_parsing_errors": True
        }
    )
    
    return agent_executor

def ask_admin_agent(query: str) -> str:
    """Executes a natural language query against the SQL Database using Langchain + Gemini"""
    agent = get_admin_agent()
    # Adding a system prompt prefix to ensure it behaves as a read-only analytics assistant
    prefix = (
        "You are an expert Data Insights AI and Business Analyst for the 'Hair Ways' salon administration page. "
        "Your job is to answer the admin's questions by querying the PostgreSQL database intelligently. "
        "CRITICAL RULES:\n"
        "1. NEVER execute DML commands (INSERT, UPDATE, DELETE, DROP). Only use SELECT.\n"
        "2. Mandatory JOINs: You must NEVER output raw database IDs (e.g., 'employee ID 9', 'customer ID 2') for foreign keys in your final answer. You must ALWAYS write SQL queries using JOIN clauses to fetch the actual, human-readable names (e.g., join the booking table with the employee/customer tables to get their exact names, and the service table for the service name).\n"
        "3. Business Formatting: The final output must read like a natural, professional business report for a salon owner (e.g., 'There is 1 booking today at 6:00 PM for John Doe, assigned to stylist Jane Smith.').\n"
        "4. Analyze the database schema carefully under the hood, but NEVER expose raw database schema, table names, or internal data structures to the user.\n"
        "5. If the user greets you (e.g., 'hello', 'hi'), reply EXACTLY with: 'Hello! I am your Data Insights AI. I can help you analyze revenue, bookings, and staff performance. What would you like to know?' Do not query the database for a greeting.\n\n"
        f"Admin Question: {query}"
    )
    
    response = agent.invoke({"input": prefix})
    return response.get("output", "I could not find an answer to that.")

