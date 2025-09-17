from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# Create Mongo client
client = AsyncIOMotorClient(settings.MONGO_URL)

# Database reference
db = client[settings.DATABASE_NAME]

# Dependency for DB (used in routes)
async def get_db():
    return db