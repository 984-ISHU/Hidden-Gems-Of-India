from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.artisan import create_artisan

router = APIRouter()

class ArtisanCreate(BaseModel):
    name: str

@router.post("/artisans", response_model=dict)
async def create_artisan_api(artisan: ArtisanCreate):
    result = await create_artisan(artisan.name)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create artisan")
    return result