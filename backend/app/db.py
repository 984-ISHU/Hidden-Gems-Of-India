import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Get env variables
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/hidden_gems")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hidden_gems")

# Create Mongo client
client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]