import os
from langchain_google_genai import ChatGoogleGenerativeAI
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

    # Initialize Gemini LLM
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is missing.")
        
    llm = ChatGoogleGenerativeAI(
        model="gemini-flash-latest",
        google_api_key=api_key,
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
        "2. Analyze the database schema carefully under the hood, but NEVER expose raw database schema, table names, or internal data structures to the user.\n"
        "3. Always frame your responses in professional business terms (e.g., 'Total Revenue', 'Upcoming Bookings') rather than database jargon.\n"
        "4. If the user greets you (e.g., 'hello', 'hi'), reply EXACTLY with: 'Hello! I am your Data Insights AI. I can help you analyze revenue, bookings, and staff performance. What would you like to know?' Do not query the database for a greeting.\n"
        "5. Provide clear, concise answers based explicitly on the calculated real business data from SQL query results.\n\n"
        f"Admin Question: {query}"
    )
    
    response = agent.invoke({"input": prefix})
    return response.get("output", "I could not find an answer to that.")

