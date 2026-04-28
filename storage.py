from google.cloud import storage
from pathlib import Path
import os
import uuid
from config import BASE_DIR, GCP_PROJECT_ID, GCS_BUCKET_NAME, UPLOAD_DIR

def upload_image(file):
    filename = f"{uuid.uuid4().hex}_{file.filename}"

    try:
        client = storage.Client(project=GCP_PROJECT_ID)
        bucket = client.bucket(GCS_BUCKET_NAME)
        blob = bucket.blob(filename)
        file.stream.seek(0)
        blob.upload_from_file(file.stream, content_type=file.content_type)
        return f"https://storage.googleapis.com/{GCS_BUCKET_NAME}/{filename}"
    except Exception:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        file.stream.seek(0)
        destination = UPLOAD_DIR / filename
        file.save(destination)
        return f"/uploads/{filename}"
