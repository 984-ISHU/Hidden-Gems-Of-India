import os
from dotenv import load_dotenv

load_dotenv()  # Load .env variables

class Settings:
    PROJECT_NAME: str = "Hidden Gems of India"
    PROJECT_VERSION: str = "1.0.0"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/hidden_gems"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()
