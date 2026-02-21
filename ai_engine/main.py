from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

@app.post("/api/ai/predict/face-shape")
def predict_face_shape():
    """Placeholder for future AI computer vision model"""
    # Later this will accept an image upload and return the shape + recommended hairstyles
    return {
        "face_shape": "Oval",
        "confidence": 0.95,
        "recommended_hairstyles": [
            "Classic Pompadour",
            "Buzz Cut",
            "Textured Crop"
        ]
    }
