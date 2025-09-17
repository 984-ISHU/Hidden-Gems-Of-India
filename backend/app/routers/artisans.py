from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.db import db
from app.models.artisan import ArtisanProfileUpdate, ArtisanResponse
from app.routers.auth import hash_password  # Import your password hashing function
from datetime import datetime

router = APIRouter(prefix="/artisans", tags=["Artisans"])


@router.get("/{artisan_id}", response_model=ArtisanResponse)
async def get_artisan(artisan_id: str):
    if not ObjectId.is_valid(artisan_id):
        raise HTTPException(status_code=400, detail="Invalid artisan ID")

    artisan = await db["artisans"].find_one({"_id": ObjectId(artisan_id)})
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan not found")

    # Map _id -> id
    artisan["id"] = str(artisan["_id"])
    return artisan


@router.patch("/{artisan_id}")
async def update_artisan(artisan_id: str, payload: ArtisanProfileUpdate):
    if not ObjectId.is_valid(artisan_id):
        raise HTTPException(status_code=400, detail="Invalid artisan ID")

    update_data = payload.dict(exclude_unset=True)

    # Handle password update if present
    if "password" in update_data:
        update_data["password_hash"] = hash_password(update_data.pop("password"))

    if not update_data:
        raise HTTPException(status_code=400, detail="No update fields provided")

    update_data["updated_at"] = datetime.utcnow()  # Update the timestamp

    result = await db["artisans"].update_one(
        {"_id": ObjectId(artisan_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artisan not found")

    return {"status": "success"}


@router.get("/", response_model=list[ArtisanResponse])
async def search_artisans(skill: str | None = None, location: str | None = None):
    query = {}
    if skill:
        query["skills"] = {"$in": [skill]}
    if location:
        query["location"] = location

    artisans = []
    async for artisan in db["artisans"].find(query):
        artisan["id"] = str(artisan["_id"])
        artisans.append(artisan)

    return artisans