from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import cv2
from skimage.measure import shannon_entropy
from io import BytesIO

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Utility functions
# -------------------------

def load_image(file_bytes):
    return Image.open(BytesIO(file_bytes)).convert("RGB")

def gray_np(img, size=(512, 512)):
    img = img.resize(size)
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2GRAY)

def noise_variance(gray):
    return float(np.var(gray))

def entropy_score(gray):
    return float(shannon_entropy(gray))

def edge_density(gray):
    edges = cv2.Canny(gray, 100, 200)
    return float(np.sum(edges > 0) / edges.size)

def straight_edge_ratio(gray):
    edges = cv2.Canny(gray, 100, 200)
    lines = cv2.HoughLinesP(
        edges, 1, np.pi / 180, threshold=100,
        minLineLength=60, maxLineGap=10
    )
    if lines is None:
        return 0.0
    hv = 0
    for l in lines:
        x1, y1, x2, y2 = l[0]
        if abs(x1 - x2) < 6 or abs(y1 - y2) < 6:
            hv += 1
    return float(hv / len(lines))

def unique_color_ratio(img):
    small = img.resize((256, 256))
    arr = np.array(small)
    unique = np.unique(arr.reshape(-1, 3), axis=0)
    return float(len(unique) / (256 * 256))

def color_saturation(img):
    hsv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2HSV)
    return float(np.mean(hsv[:, :, 1]))

# -------------------------
# Stage-1 Classification
# -------------------------

def classify_image(img):
    gray = gray_np(img)
    noise = noise_variance(gray)
    entropy = entropy_score(gray)
    edges = edge_density(gray)
    straight_edges = straight_edge_ratio(gray)
    color_var = unique_color_ratio(img)
    saturation = color_saturation(img)

    reasons = []

    # ---------- Screenshot / UI ----------
    if straight_edges > 0.55 and edges > 0.14 and noise < 300:
        reasons += [
            "Strong horizontal and vertical edges",
            "Text/UI-like structure",
            "Low natural noise"
        ]
        return {
            "image_type": "Screenshot / UI / Text Image",
            "confidence": "High",
            "reason": reasons
        }

    # ---------- Digital Illustration ----------
    if color_var < 0.02 and entropy < 5.4 and noise < 280:
        reasons += [
            "Flat or stylized color regions",
            "Low texture randomness",
            "Painterly or drawn appearance"
        ]
        return {
            "image_type": "Digital Illustration / Artwork",
            "confidence": "High",
            "reason": reasons
        }

    # ---------- Poster / Wallpaper / Stylized ----------
    if saturation > 130 and noise < 360:
        reasons += [
            "Highly saturated colors",
            "Stylized lighting",
            "Enhanced or artistic appearance"
        ]
        return {
            "image_type": "Poster / Wallpaper / Stylized Art",
            "confidence": "High",
            "reason": reasons
        }

    # ---------- Photographic-looking ----------
    if entropy > 6.0 and noise > 380:
        subtype = "Likely Real Photo"
        if saturation > 110:
            subtype = "Cinematic / Stylized Frame"
        reasons += [
            "Complex real-world texture",
            "Photographic noise pattern",
            f"Subtype: {subtype}"
        ]
        return {
            "image_type": "Photographic-looking Image",
            "subtype": subtype,
            "confidence": "Medium",
            "reason": reasons
        }

    # ---------- Unknown ----------
    reasons.append("Conflicting visual characteristics")
    return {
        "image_type": "Unknown / Mixed",
        "confidence": "Low",
        "reason": reasons
    }

# -------------------------
# API Endpoint
# -------------------------

@app.post("/analyze")
async def analyze(image: UploadFile = File(...)):
    try:
        img = load_image(await image.read())
    except Exception:
        return {"error": "Invalid image file"}

    result = classify_image(img)

    return {
        "filename": image.filename,
        **result
    }
