from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.services.artisan_service import ArtisanService
from app.services.marketing_service import MarketingService, rag_service
from app.models.artisan import ArtisanProfileUpdate

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

@router.get("/{artisan_id}")
async def get_artisan(artisan_id: str):
    """Get a single artisan by ID"""
    try:
        artisan = await ArtisanService.get_artisan_by_id(artisan_id)
        if not artisan:
            raise HTTPException(status_code=404, detail="Artisan not found")
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
async def add_artisan_product(artisan_id: str, product_data: Dict[str, Any]):
    """Add a new product for an artisan"""
    try:
        result = await ArtisanService.add_artisan_product(artisan_id, product_data)
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

# Marketing and RAG routes
@router.post("/{artisan_id}/marketing")
async def get_marketing_output(artisan_id: str, request_data: Dict[str, Any]):
    """Generate marketing content for an artisan"""
    try:
        prompt = request_data.get("prompt", "")
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        result = await MarketingService.generate_marketing_content(artisan_id, prompt)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{artisan_id}/rag")
async def get_rag_output(artisan_id: str, request_data: Dict[str, Any]):
    """Get RAG response for artisan queries"""
    try:
        query = request_data.get("query", "")
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        result = await rag_service.get_rag_response(artisan_id, query)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))