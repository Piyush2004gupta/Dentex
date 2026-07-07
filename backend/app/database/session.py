# Database session is bypassed. No connection pool or SQLAlchemy engines are initialized.

class DummyMetadata:
    def create_all(self, *args, **kwargs):
        pass

class Base:
    metadata = DummyMetadata()

def get_db():
    """
    Stub dependency yielding None, since database operations are handled in-memory.
    """
    yield None
