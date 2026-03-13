from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from dotenv import load_dotenv
import os

from app.config import settings

load_dotenv()

def _get_env_value(*names: str) -> str | None:
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    return None


def get_database_url() -> str:
    if settings.database_url:
        return settings.database_url

    user = _get_env_value("DB_USER", "POSTGRES_USER", "user")
    password = _get_env_value("DB_PASSWORD", "POSTGRES_PASSWORD", "password")
    host = _get_env_value("DB_HOST", "POSTGRES_HOST", "host")
    port = _get_env_value("DB_PORT", "POSTGRES_PORT", "port")
    dbname = _get_env_value("DB_NAME", "POSTGRES_DB", "dbname")

    if not all([user, password, host, port, dbname]):
        raise RuntimeError("Database configuration is incomplete. Set DATABASE_URL or DB_* environment variables.")

    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}?sslmode=require"


DATABASE_URL = get_database_url()

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

