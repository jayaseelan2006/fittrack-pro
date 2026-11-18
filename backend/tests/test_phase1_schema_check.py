
import os
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import pytest
from sqlalchemy.exc import IntegrityError

from app.database import Base, engine, SessionLocal
import app.models as m


def test_database_tables_created():
    Base.metadata.create_all(engine)

    tables = inspect_tables = __import__(
        "sqlalchemy"
    ).inspect(engine).get_table_names()

    assert len(tables) > 0


def test_user_and_profile_creation():
    db = SessionLocal()
    try:
        Base.metadata.create_all(engine)

        user = m.User(
            email="test@example.com",
            password_hash="test123"
        )

        db.add(user)
        db.commit()

        assert user.id is not None
    finally:
        db.close()


def test_duplicate_email_constraint():
    db = SessionLocal()
    try:
        db.add(m.User(email="duplicate@example.com", password_hash="x"))
        db.commit()

        db.add(m.User(email="duplicate@example.com", password_hash="x"))

        with pytest.raises(IntegrityError):
            db.commit()

        db.rollback()
    finally:
        db.close()
