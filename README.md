
AuthentiScan is a web-based application that analyzes an uploaded image and classifies it based on its visual appearance.
This is the initial stage of a multi-stage image authenticity pipeline.

Current focus: What type of image is this?
Not: Is it AI-generated or real.

Current Capabilities

The system classifies images into the following visual categories:

Photographic-looking Image

Digital Illustration / Artwork

Screenshot / UI / Text Image

Poster / Wallpaper / Stylized Art

Unknown / Mixed

For each uploaded image, the system returns:

Image type

Confidence level (High / Medium / Low)

Human-readable reasons explaining the decision

Why This Design?

Most AI-detection systems make false claims by skipping image-type analysis.

This project follows a two-stage architecture:

Stage 1 (Current)

Classify the visual type of the image.

Stage 2 (Planned)

AI authenticity detection (only when applicable).

This avoids incorrect judgments and improves reliability.

Tech Stack
Frontend

React.js

Tailwind CSS

Lucide Icons

Backend

FastAPI (Python)

OpenCV

NumPy

Pillow

scikit-image

Project Structure
project-root/
│
├── frontend/       # React UI
│
└── backend/        # FastAPI server
    ├── main.py
    └── requirements.txt

How to Run
Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


API runs at:

http://127.0.0.1:8000


Swagger UI:

http://127.0.0.1:8000/docs

Frontend
cd frontend
npm install
npm run dev

Example API Response
{
  "filename": "sample.jpg",
  "image_type": "Digital Illustration / Artwork",
  "confidence": "High",
  "reason": [
    "Flat or stylized color regions",
    "Low texture randomness",
    "Painterly or drawn appearance"
  ]
}

Current Limitations

This version does NOT detect AI-generated images.

Classification is rule-based, not ML-based.

Some edge cases may be misclassified.

The system prioritizes explainability over certainty.

Planned Features

AI-generated vs Real detection (Stage 2)

Machine learning integration

More refined categories

Confidence visualizations

Downloadable reports

Improved UI

Dataset-based evaluation

Educational Purpose

This project demonstrates:

Multi-stage AI system design

Explainable AI principles

Frontend–backend integration

Responsible AI development

Rule-based computer vision

System architecture thinking