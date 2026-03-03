import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from services import analyze_face_shape
from agents.customer_agent import ask_customer_agent
from agents.admin_agent import ask_admin_agent

app = FastAPI(
    title="Hair Ways API - AI Engine",
    description="Microservice handling computer vision and ML tasks",
    version="1.0.0"
)

# Allow specific origins based on environment variable (like Django)
_cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '')
if _cors_origins:
    allow_origins = [o.strip() for o in _cors_origins.split(',') if o.strip()]
else:
    # Fallback - allow all (development only)
    allow_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve hairstyle preview images at /ai-static/images/<slug>.jpg
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(os.path.join(STATIC_DIR, "images"), exist_ok=True)
app.mount("/ai-static", StaticFiles(directory=STATIC_DIR), name="ai-static")


@app.get("/api/ai/health")
def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy", "service": "ai_engine"}


@app.post("/api/ai/analyze-face")
async def analyze_face(image: UploadFile = File(...)):
    """Receives an image upload from the frontend and evaluates the face shape using MediaPipe"""
    try:
        # Read the image file bytes
        contents = await image.read()

        # Analyze the face using the OpenCV/MediaPipe service
        result = analyze_face_shape(contents)

        return {
            "success": True,
            "data": result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Server Error during AI Analysis: {e}")
        raise HTTPException(status_code=500, detail="An error occurred within the AI visual processor.")


class ChatRequest(BaseModel):
    query: str


@app.post("/api/ai/chat/customer")
async def chat_customer(request: ChatRequest):
    """Customer Support AI Agent for standard QA regarding Hair Ways services"""
    try:
        answer = ask_customer_agent(request.query)
        return {"response": answer}
    except Exception as e:
        print(f"Customer Chat Error: {e}")
        raise HTTPException(status_code=500, detail="Customer AI is temporarily down.")


@app.post("/api/ai/chat/admin")
async def chat_admin(request: ChatRequest):
    """Admin Data Insights Agent for NLP Database Querying"""
    try:
        answer = ask_admin_agent(request.query)
        return {"response": answer}
    except Exception as e:
        print(f"Admin Chat Error: {e}")
        raise HTTPException(status_code=500, detail="Admin AI failed to query database.")

