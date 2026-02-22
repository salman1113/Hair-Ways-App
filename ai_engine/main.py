from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services import analyze_face_shape

app = FastAPI(
    title="Hair Ways API - AI Engine",
    description="Microservice handling computer vision and ML tasks",
    version="1.0.0"
)

# Allow all origins for now until proxy is fully setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
