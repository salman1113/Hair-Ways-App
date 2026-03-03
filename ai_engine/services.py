import cv2
import mediapipe as mp
import numpy as np
import os

# 1. FORCE CPU MODE: MediaPipe GPU എറർ ഒഴിവാക്കാൻ ഇത് അത്യാവശ്യമാണ്
os.environ['PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION'] = 'python'

def _style_entry(name: str) -> dict:
    """Build a recommendation object with a deterministic image URL from the style name."""
    slug = name.lower().replace(" ", "_").replace("/", "_").replace("-", "_")
    # ശ്രദ്ധിക്കുക: നിന്റെ ലോഡ് ബാലൻസർ വഴി ഈ ഇമേജ് കിട്ടണമെങ്കിൽ /static/ പാത്ത് ALB-യിൽ സെറ്റ് ചെയ്യണം
    return {"name": name, "image_url": f"/static/images/{slug}.jpg"}

# Recommendation mappings
SHAPE_RECOMMENDATIONS = {
    "Oval": [
        _style_entry("Classic Pompadour"),
        _style_entry("Buzz Cut"),
        _style_entry("Textured Crop"),
        _style_entry("Mid Fade with Top Volume"),
    ],
    "Square": [
        _style_entry("Undercut"),
        _style_entry("Slicked Back"),
        _style_entry("Faux Hawk"),
        _style_entry("Short Back and Sides"),
    ],
    "Round": [
        _style_entry("High Skin Fade with Pompadour"),
        _style_entry("Quiff"),
        _style_entry("Side Part"),
        _style_entry("Spiky Top"),
    ],
    "Heart": [
        _style_entry("Fringe Bangs"),
        _style_entry("Messy Top"),
        _style_entry("Medium Length Swept Back"),
        _style_entry("Side Parted Medium Hair"),
    ],
    "Oblong": [
        _style_entry("Crew Cut"),
        _style_entry("Side Part"),
        _style_entry("Fringe"),
        _style_entry("Short Afro"),
    ],
}

def analyze_face_shape(image_bytes: bytes) -> dict:
    """
    Takes an image byte array, uses MediaPipe (CPU mode) to detect facial landmarks,
    and returns face shape classification with hairstyle recommendations.
    """
    # Decoding the image for OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image file provided.")

    # Convert to RGB for MediaPipe
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    h, w, _ = img.shape

    # 2. FIXED INITIALIZATION: Global GL Context ഒഴിവാക്കാൻ നേരിട്ട് ഇനീഷ്യലൈസ് ചെയ്യുന്നു
    mp_face_mesh = mp.solutions.face_mesh
    
    # Context Manager ഉപയോഗിക്കാതെ നേരിട്ട് ക്രിയേറ്റ് ചെയ്യുന്നത് പലപ്പോഴും ECS-ൽ കൂടുതൽ സ്റ്റേബിൾ ആണ്
    face_mesh = mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
    )
    
    try:
        results = face_mesh.process(img_rgb)
        
        if not results or not results.multi_face_landmarks:
            raise ValueError("No face detected in the image.")

        landmarks = results.multi_face_landmarks[0].landmark

        # Helper to get pixel coordinates
        def get_pt(index: int) -> np.ndarray:
            pt = landmarks[index]
            return np.array([pt.x * w, pt.y * h])

        # Relevant landmark points
        top_head = get_pt(10)       # Top of forehead
        bottom_chin = get_pt(152)   # Bottom of chin
        left_cheek = get_pt(234)    # Left cheekbone
        right_cheek = get_pt(454)   # Right cheekbone
        left_jaw = get_pt(132)      # Left jaw
        right_jaw = get_pt(361)     # Right jaw

        # Calculate distances
        face_length = np.linalg.norm(top_head - bottom_chin)
        face_width = np.linalg.norm(left_cheek - right_cheek)
        jaw_width = np.linalg.norm(left_jaw - right_jaw)

        # Ratio-based classification
        ratio_width_length = face_width / face_length
        jaw_ratio = jaw_width / face_width

        # Simple heuristic classification
        if ratio_width_length > 0.85:
            shape = "Square" if jaw_ratio > 0.85 else "Round"
        elif ratio_width_length < 0.7:
            shape = "Oblong"
        else:
            shape = "Heart" if jaw_ratio < 0.75 else "Oval"

        return {
            "face_shape": shape,
            "metrics": {
                "face_width_to_length_ratio": round(ratio_width_length, 2),
                "jaw_to_face_width_ratio": round(jaw_ratio, 2),
            },
            "recommended_hairstyles": SHAPE_RECOMMENDATIONS.get(shape, []),
        }
    
    finally:
        # മെമ്മറി റിലീസ് ചെയ്യാൻ മറക്കരുത്
        face_mesh.close()