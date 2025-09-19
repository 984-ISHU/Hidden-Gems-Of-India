from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.marketing_service import rag_service

router = APIRouter(tags=["Profile"])

@router.post("/generate-story")
async def generate_story_from_bio(request_data: Dict[str, Any]):
    """Generate a story from artisan bio"""
    try:
        bio = request_data.get("bio", "")
        if not bio:
            raise HTTPException(status_code=400, detail="Bio is required")
        
        result = await rag_service.generate_story_from_bio(bio)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))