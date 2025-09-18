from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import logging
from app.services.product_description_gen import generate_description

router = APIRouter(prefix="/product-description", tags=["Marketing"])
logger = logging.getLogger(__name__)

# Request models
class ProductDescriptionRequest(BaseModel):
    keywords: List[str] = Field(..., description="List of keywords describing the product", min_items=1)
    product_name: Optional[str] = Field(None, description="Optional product name")
    craft_type: Optional[str] = Field(None, description="Type of craft (e.g., pottery, weaving)")
    artisan_location: Optional[str] = Field(None, description="Location of the artisan")
    target_length: str = Field("medium", description="Target length: short, medium, or long")
    tone: str = Field("professional", description="Tone: professional, casual, artistic, or traditional")

class BulkProductRequest(BaseModel):
    products: List[Dict] = Field(..., description="List of product data dictionaries", min_items=1)

# Response models
class ProductDescriptionResponse(BaseModel):
    description: str
    title: str
    short_description: str
    highlights: List[str]
    generated_at: str
    keywords_used: List[str]

class BulkProductResponse(BaseModel):
    results: List[Dict]
    success_count: int
    error_count: int

@router.post("/generate", response_model=ProductDescriptionResponse)
async def generate_product_description(request: ProductDescriptionRequest):
    """
    Generate a compelling product description based on keywords and context.
    
    This endpoint uses GroqCloud's LLM to create authentic, culturally-sensitive 
    product descriptions for Indian handicrafts and artisan products.
    """
    try:
        result = await generate_description(
            keywords=request.keywords,
            product_name=request.product_name,
            craft_type=request.craft_type,
            artisan_location=request.artisan_location,
            target_length=request.target_length,
            tone=request.tone
        )
        
        return ProductDescriptionResponse(**result)
        
    except ValueError as e:
        logger.error(f"Validation error in product description generation: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating product description: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate product description")