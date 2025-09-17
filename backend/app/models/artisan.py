from app.db import client
from bson import ObjectId

# Use the 'dev' database and 'artisans' collection
db = client["dev"]
artisans_collection = db["artisans"]

async def create_artisan(name: str) -> dict:
    artisan_doc = {"name": name}
    result = await artisans_collection.insert_one(artisan_doc)
    return {"id": str(result.inserted_id), "name": name}