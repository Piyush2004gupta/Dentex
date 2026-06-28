import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from main import app
from app.database.session import Base, get_db

# Use separate SQLite database for unit tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_dentex.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestDentexAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        # Build schemas
        Base.metadata.create_all(bind=engine)

    def tearDown(self):
        # Clear tables
        Base.metadata.drop_all(bind=engine)
        if os.path.exists("./test_dentex.db"):
            try:
                os.remove("./test_dentex.db")
            except Exception:
                pass

    def test_user_registration_and_login(self):
        # 1. Test registration
        reg_payload = {
            "username": "testdoctor",
            "email": "doctor@dentex.com",
            "password": "securepassword123",
            "role": "admin"
        }
        response = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(response.status_code, 201)
        res_data = response.json()
        self.assertIn("access_token", res_data)
        self.assertEqual(res_data["user"]["username"], "testdoctor")
        self.assertEqual(res_data["user"]["role"], "admin")

        # 2. Test registration duplicate username
        response = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Username already registered")

        # 3. Test login
        login_payload = {
            "username": "testdoctor",
            "password": "securepassword123"
        }
        response = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(response.status_code, 200)
        login_data = response.json()
        self.assertIn("access_token", login_data)
        
        token = login_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 4. Test authenticated profile endpoint
        response = self.client.get("/api/profile", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["email"], "doctor@dentex.com")

        # 5. Test unauthenticated profile endpoint
        response = self.client.get("/api/profile")
        self.assertEqual(response.status_code, 401)

        # 6. Test analytics retrieval (empty state)
        response = self.client.get("/api/analytics", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["total_predictions"], 0)
        self.assertEqual(response.json()["healthy_cases"], 0)

if __name__ == "__main__":
    unittest.main()
