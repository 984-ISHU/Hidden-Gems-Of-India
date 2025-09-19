
from fastapi import APIRouter, HTTPException, Query
from app.services.marketing_service import generate_story_for_artisan

router = APIRouter(tags=["Profile"])

@router.get("/generate-story")
async def generate_story_from_bio(
    artisan_id: str = Query(..., description="Artisan ID"),
    extra_info: str = Query("", description="Additional info from artisan (optional)")
):
    """Generate a story for an artisan using their ID and extra info (query params)."""
    try:
        if not artisan_id:
            raise HTTPException(status_code=400, detail="artisan_id is required")
        result = await generate_story_for_artisan(artisan_id, extra_info)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))