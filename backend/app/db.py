import os
from motor.motor_asyncio import AsyncIOMotorClient

# Get env variables
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/hidden_gems")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hidden_gems")

# Create Mongo client
client = AsyncIOMotorClient(MONGO_URL)

# Database reference
db = client[DATABASE_NAME]

# Dependency for DB (used in routes)
async def get_db():
    return db