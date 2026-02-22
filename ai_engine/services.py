import cv2
import mediapipe as mp
import numpy as np
import io

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True, 
    max_num_faces=1, 
    refine_landmarks=True,
    min_detection_confidence=0.5
)

# Recommendation mappings
SHAPE_RECOMMENDATIONS = {
    "Oval": [
        "Classic Pompadour",
        "Buzz Cut",
        "Textured Crop",
        "Mid Fade with Top Volume"
    ],
    "Square": [
        "Undercut",
        "Slicked Back",
        "Faux Hawk",
        "Short Back and Sides"
    ],
    "Round": [
        "High Skin Fade with Pompadour",
        "Quiff",
        "Side Part",
        "Spiky Top"
    ],
    "Heart": [
        "Fringe / Bangs",
        "Messy Top",
        "Medium Length Swept Back",
        "Side Parted Medium Hair"
    ],
    "Oblong": [
        "Crew Cut",
        "Side Part",
        "Fringe",
        "Short Afro"
    ]
}

def analyze_face_shape(image_bytes: bytes):
    """
    Takes an image byte array, uses MediaPipe to detect facial landmarks,
    calculates facial proportions, and returns the classified face shape and recommendations.
    """
    # Decoding the image for OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Invalid image file provided.")

    # Convert to RGB for MediaPipe
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    h, w, _ = img.shape
    
    results = face_mesh.process(img_rgb)
    
    if not results.multi_face_landmarks:
        raise ValueError("No face detected in the image.")
        
    landmarks = results.multi_face_landmarks[0].landmark
    
    # Helper to get pixel coordinates
    def get_pt(index):
        pt = landmarks[index]
        return np.array([pt.x * w, pt.y * h])
        
    # Get relevant landmark points
    # Index 10: Top of forehead (hairline approx)
    # Index 152: Bottom of chin
    # Index 234: Left side of face (cheekbone area)
    # Index 454: Right side of face (cheekbone area)
    # Index 132: Left jaw
    # Index 361: Right jaw
    
    top_head = get_pt(10)
    bottom_chin = get_pt(152)
    left_cheek = get_pt(234)
    right_cheek = get_pt(454)
    left_jaw = get_pt(132)
    right_jaw = get_pt(361)
    
    # Calculate Distances
    face_length = np.linalg.norm(top_head - bottom_chin)
    face_width = np.linalg.norm(left_cheek - right_cheek)
    jaw_width = np.linalg.norm(left_jaw - right_jaw)
    
    # Simple Face Classification Math
    ratio_width_length = face_width / face_length
    
    # Simple heuristic classification
    shape = "Oval"
    
    if ratio_width_length > 0.85:
        # Face is quite wide compared to length
        if jaw_width / face_width > 0.85:
            shape = "Square"
        else:
            shape = "Round"
    else:
        # Face is longer than it is wide
        if ratio_width_length < 0.7:
            shape = "Oblong"
        else:
            if jaw_width / face_width < 0.75:
                shape = "Heart"
            else:
                shape = "Oval"
                
    # Format Response
    return {
        "face_shape": shape,
        "metrics": {
            "face_width_to_length_ratio": round(ratio_width_length, 2),
            "jaw_to_face_width_ratio": round(jaw_width / face_width, 2)
        },
        "recommended_hairstyles": SHAPE_RECOMMENDATIONS.get(shape, [])
    }
