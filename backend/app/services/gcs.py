import os
from google.cloud import storage
from app.config import settings

class GCSService:
    def __init__(self):
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.client = None
        self._initialized = False

    def _init_client(self):
        if not self._initialized:
            try:
                # ADC (Application Default Credentials) on GCP
                self.client = storage.Client()
                self._initialized = True
            except Exception as e:
                print(f"Warning: Could not initialize Google Cloud Storage client: {e}. Fallback to local files only.")

    def upload_file(self, local_path: str, gcs_path: str) -> bool:
        self._init_client()
        if not self.client:
            return False
        try:
            bucket = self.client.bucket(self.bucket_name)
            blob = bucket.blob(gcs_path)
            blob.upload_from_filename(local_path)
            print(f"Uploaded {local_path} to GCS bucket {self.bucket_name} at {gcs_path}")
            return True
        except Exception as e:
            print(f"Error uploading file to GCS: {e}")
            return False

    def download_file_to_bytes(self, gcs_path: str) -> bytes:
        self._init_client()
        if not self.client:
            return None
        try:
            bucket = self.client.bucket(self.bucket_name)
            blob = bucket.blob(gcs_path)
            if not blob.exists():
                return None
            return blob.download_as_bytes()
        except Exception as e:
            print(f"Error downloading file from GCS: {e}")
            return None

gcs_service = GCSService()
