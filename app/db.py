from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# SQLAlchemy engine
engine = create_engine(settings.DATABASE_URL, echo=True)

# DB session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency for DB session (used in routes)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
