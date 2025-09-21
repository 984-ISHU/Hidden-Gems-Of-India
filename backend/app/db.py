import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hidden_gems")

client = AsyncIOMotorClient(
    MONGO_URL,
    tlsCAFile=certifi.where()
)
db = client[DATABASE_NAME]