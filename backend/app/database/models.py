import json
import os
from datetime import datetime

USERS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "users.json")

class User:
    def __init__(
        self,
        id=1,
        username="dentex_admin",
        email="admin@dentex.com",
        role="admin",
        name="Dentex Admin",
        age=30,
        phone_no="1234567890",
        gender="Other",
        password_hash="admin123",
        consent_terms=True,
        consent_not_professional_ai=True,
        consent_store_images=True,
        created_at=None
    ):
        self.id = id
        self.username = username
        self.email = email
        self.role = role
        self.name = name
        self.age = age
        self.phone_no = phone_no
        self.gender = gender
        self.password_hash = password_hash
        self.consent_terms = consent_terms
        self.consent_not_professional_ai = consent_not_professional_ai
        self.consent_store_images = consent_store_images
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "name": self.name,
            "age": self.age,
            "phone_no": self.phone_no,
            "gender": self.gender,
            "password_hash": self.password_hash,
            "consent_terms": self.consent_terms,
            "consent_not_professional_ai": self.consent_not_professional_ai,
            "consent_store_images": self.consent_store_images,
            "created_at": self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }

    @classmethod
    def from_dict(cls, data):
        created_at_val = data.get("created_at")
        if created_at_val:
            try:
                created_at_val = datetime.fromisoformat(created_at_val)
            except Exception:
                pass
        return cls(
            id=data["id"],
            username=data["username"],
            email=data["email"],
            role=data.get("role", "patient"),
            name=data.get("name", ""),
            age=data.get("age", 0),
            phone_no=data.get("phone_no", ""),
            gender=data.get("gender", ""),
            password_hash=data["password_hash"],
            consent_terms=data.get("consent_terms", True),
            consent_not_professional_ai=data.get("consent_not_professional_ai", True),
            consent_store_images=data.get("consent_store_images", True),
            created_at=created_at_val
        )

def load_users():
    if not os.path.exists(USERS_FILE):
        # Seed default admin user
        admin = User(
            id=1,
            username="dentex_admin",
            email="admin@dentex.com",
            role="admin",
            name="Dentex Admin",
            age=30,
            phone_no="1234567890",
            gender="Other",
            password_hash="admin123",
            consent_terms=True,
            consent_not_professional_ai=True,
            consent_store_images=True
        )
        save_users([admin])
        return [admin]
    try:
        with open(USERS_FILE, "r") as f:
            data = json.load(f)
            return [User.from_dict(u) for u in data]
    except Exception:
        return []

def save_users(users):
    try:
        with open(USERS_FILE, "w") as f:
            json.dump([u.to_dict() for u in users], f, indent=4)
    except Exception as e:
        print("Error saving users:", e)

users_store = load_users()


class Prediction:
    def __init__(
        self, id, user_id, filename, filepath, disease, confidence,
        bounding_box=None, class_probabilities=None,
        blur_score=0.0, brightness_score=0.0, is_valid=True,
        tooth_number=None, quadrant=None, created_at=None
    ):
        self.id                  = id
        self.user_id             = user_id
        self.filename            = filename
        self.filepath            = filepath
        self.disease             = disease
        self.confidence          = confidence
        self.bounding_box        = bounding_box
        self.class_probabilities = class_probabilities
        self.blur_score          = blur_score
        self.brightness_score    = brightness_score
        self.is_valid            = is_valid
        self.tooth_number        = tooth_number   # e.g. "Tooth 3"
        self.quadrant            = quadrant       # e.g. "Q2 (Upper Left)"
        self.created_at          = created_at or datetime.utcnow()

    @property
    def user(self):
        return User(id=self.user_id)

# In-memory store for predictions
predictions_store: list[Prediction] = []
