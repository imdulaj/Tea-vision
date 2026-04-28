import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parents[2]
MODEL_DIR = BASE_DIR / "models"
UPLOAD_DIR = BASE_DIR / "uploads"

HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", 8080))

DB_HOST = os.environ.get("DB_HOST", "34.136.45.26")
DB_NAME = os.environ.get("DB_NAME", "tea-analyzer")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASS = os.environ.get("DB_PASS", "Nimna654321@")
DB_PORT = int(os.environ.get("DB_PORT", 5432))

GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "speech-to-text-488803")
GCS_BUCKET_NAME = os.environ.get("GCS_BUCKET_NAME", "tea-analyzer-image-bucket")

# Firebase Configuration
FIREBASE_DATABASE_URL = os.environ.get(
    "FIREBASE_DATABASE_URL", 
    "https://tea-analyzer-7a2b0-default-rtdb.asia-southeast1.firebasedatabase.app"
)
FIREBASE_AUTH_TOKEN = os.environ.get(
    "FIREBASE_AUTH_TOKEN",
    "Wtg5xGwZjRHN4zDIyd8f0tLRf69CTUAyMk7Buep4"
)


def resolve_model_path(filename: str) -> str:
    candidates = [
        MODEL_DIR / filename,
        BASE_DIR / filename,
        PROJECT_ROOT / "tea_analyzer-be" / "backend" / "models" / filename,
        PROJECT_ROOT / "tea_analyzer-be" / "backend" / filename,
    ]

    for candidate in candidates:
        if candidate.exists():
            return str(candidate)

    return str(MODEL_DIR / filename)
