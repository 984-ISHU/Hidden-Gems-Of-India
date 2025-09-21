from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.models.product import ProductCreate
from app.services.artisan_service import ArtisanService
from app.services.marketing_service import MarketingService
from app.models.artisan import ArtisanProfileUpdate
from fastapi import Query, File, UploadFile

router = APIRouter(prefix="/artisans", tags=["Artisans"])

@router.get("/")
async def get_artisans():
    """Get all artisans"""
    try:
        artisans = await ArtisanService.get_all_artisans()
        return artisans
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/skill/{skill}")
async def get_artisans_by_skill(skill: str):
    """Get artisans by skill"""
    try:
        artisans = await ArtisanService.get_artisans_by_skill(skill)
        return artisans
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/location/{location}")
async def get_artisans_by_location(location: str):
    """Get artisans by location"""
    try:
        artisans = await ArtisanService.get_artisans_by_location(location)
        return artisans
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}")
async def get_artisan(user_id: str):
    """Get a single artisan by user_id"""
    try:
        artisan = await ArtisanService.get_artisan_by_user_id(user_id)
        if not artisan:
            raise HTTPException(status_code=404, detail="Artisan not found")
        return artisan
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create")
async def create_artisan_profile(user_id: str):
    """Create a default artisan profile for a user"""
    try:
        artisan = await ArtisanService.create_artisan_profile(user_id)
        return artisan
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-email/{email}")
async def get_artisan_by_email(email: str):
    """Get a single artisan by email"""
    try:
        artisan = await ArtisanService.get_artisan_by_email(email)
        if not artisan:
            raise HTTPException(status_code=404, detail="Artisan not found")
        return artisan
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-by-email")
async def create_artisan_profile_by_email(email: str):
    """Create a default artisan profile for a user by email"""
    try:
        artisan = await ArtisanService.create_artisan_profile_by_email(email)
        return artisan
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{artisan_id}/profile")
async def update_artisan_profile(artisan_id: str, updates: ArtisanProfileUpdate):
    """Update artisan profile"""
    try:
        result = await ArtisanService.update_artisan_profile(artisan_id, updates)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Product management routes
@router.get("/{artisan_id}/products")
async def get_artisan_products(artisan_id: str):
    """Get all products for an artisan"""
    try:
        products = await ArtisanService.get_artisan_products(artisan_id)
        return products
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{artisan_id}/products")
async def add_artisan_product(artisan_id: str, product: ProductCreate):
    """Add a new product for an artisan"""
    try:
        result = await ArtisanService.add_artisan_product(artisan_id, product.dict(exclude_unset=True))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{artisan_id}/products/{product_id}")
async def delete_artisan_product(artisan_id: str, product_id: str):
    """Delete a product for an artisan"""
    try:
        result = await ArtisanService.delete_artisan_product(artisan_id, product_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Email-based product endpoints
@router.get("/by-email/{email}/products")
async def get_artisan_products_by_email(email: str):
    """Get all products for an artisan by email"""
    try:
        products = await ArtisanService.get_artisan_products_by_email(email)
        return products
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/by-email/{email}/products")
async def add_artisan_product_by_email(email: str, product: ProductCreate):
    """Add a new product for an artisan by email"""
    try:
        result = await ArtisanService.add_artisan_product_by_email(email, product.dict(exclude_unset=True))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Marketing and RAG routes
@router.post("/{artisan_id}/marketing")
async def get_marketing_output(
    artisan_id: str,
    prompt: str = Query(None, description="Prompt for marketing content"),
    image: UploadFile = File(None)
):
    """Generate marketing content for an artisan, considering image if provided"""
    try:
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        image_bytes = await image.read() if image else None
        result = await MarketingService.generate_marketing_content(artisan_id, prompt, image_bytes)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))