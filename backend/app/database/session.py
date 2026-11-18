from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

_kwargs = {"pool_pre_ping": True}
if settings.sqlalchemy_url.startswith("sqlite"):
    _kwargs = {"connect_args": {"check_same_thread": False}}

engine = create_engine(settings.sqlalchemy_url, **_kwargs)
if settings.sqlalchemy_url.startswith("sqlite"):
    from sqlalchemy import event

    @event.listens_for(engine, "connect")
    def _fk_on(dbapi_conn, _):  # make SQLite enforce FKs like MySQL/InnoDB
        dbapi_conn.execute("PRAGMA foreign_keys=ON")

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
