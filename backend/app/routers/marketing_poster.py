from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from app.services.marketing_poster_generator import generate_minimal_marketing_poster
import asyncio

router = APIRouter(prefix="/poster", tags=["Marketing"])

@router.post("/generate")
async def generate_poster_endpoint(
    image: UploadFile = File(..., description="Product image"),
    product_name: str = Form("", description="Product name (optional)")
):
    """
    Generate a minimal, neat marketing poster from an uploaded image.
    """
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    image_bytes = await image.read()
    try:
        poster_bytes = await asyncio.to_thread(generate_minimal_marketing_poster, image_bytes, product_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Poster generation failed: {e}")

    return StreamingResponse(
        iter([poster_bytes]),
        media_type="image/jpeg",
        headers={"Content-Disposition": f"attachment; filename=poster.jpg"}
    )