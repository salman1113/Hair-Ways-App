import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

KNOWLEDGE_PATH = "/app/data/salon_knowledge.txt"
FAISS_INDEX_PATH = "/app/data/faiss_index"

def init_vector_db():
    """Initializes the FAISS vector database by reading the salon knowledge text file."""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is missing.")

    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=api_key)

    # If the index already exists, load it directly
    if os.path.exists(FAISS_INDEX_PATH):
        return FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)

    # 1. Load the document
    if not os.path.exists(KNOWLEDGE_PATH):
        raise FileNotFoundError(f"Knowledge document not found at {KNOWLEDGE_PATH}")
        
    loader = TextLoader(KNOWLEDGE_PATH)
    docs = loader.load()

    # 2. Split the document into intelligent chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = text_splitter.split_documents(docs)

    # 3. Create FAISS VectorDB and Store
    vectorstore = FAISS.from_documents(splits, embeddings)
    
    # Ensure directory exists before saving
    os.makedirs(os.path.dirname(FAISS_INDEX_PATH), exist_ok=True)
    vectorstore.save_local(FAISS_INDEX_PATH)
    
    return vectorstore

def get_customer_qa_chain():
    """Creates the LangChain Retrieval Chain for Customer Queries"""
    # Initialize DB (creates it if it doesn't exist)
    vectorstore = init_vector_db()
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    # Initialize Gemini
    llm = ChatGoogleGenerativeAI(
        model="gemini-flash-latest",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.3 # Low temperature for factual RAG responses
    )

    # Define the System Prompt
    system_prompt = (
        "You are a friendly, professional AI receptionist for the 'Hair Ways' salon. "
        "Use the provided context below to answer the customer's questions about services, pricing, and policies. "
        "If you do not know the answer based on the context, politely say that you don't know and recommend calling the salon directly. "
        "Do not invent prices or services.\n\n"
        "Context:\n{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    return rag_chain

def ask_customer_agent(query: str) -> str:
    """Answers a public user query using standard Document Retrieval RAG"""
    try:
        qa_chain = get_customer_qa_chain()
        response = qa_chain.invoke({"input": query})
        return response.get("answer", "I'm sorry, I couldn't process your request.")
    except Exception as e:
        print(f"Error in Customer RAG: {e}")
        return "Our AI assistant is temporarily unavailable. Please try again later."
