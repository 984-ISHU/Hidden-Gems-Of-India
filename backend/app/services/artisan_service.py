from typing import List, Optional, Dict, Any
from bson import ObjectId
from app.db import db
from app.models.artisan import ArtisanProfileUpdate
from datetime import datetime

class ArtisanService:
    @staticmethod
    async def get_all_artisans() -> List[Dict[str, Any]]:
        artisans = []
        async for artisan in db["artisans"].find({}):
            artisan["id"] = str(artisan["_id"])
            artisan.pop("_id", None)  # Remove the _id field
            if "password_hash" in artisan:
                del artisan["password_hash"]
            artisans.append(artisan)
        return artisans
    
    @staticmethod
    async def get_artisans_by_skill(skill: str) -> List[Dict[str, Any]]:
        """Get artisans filtered by skill"""
        query = {"skills": {"$regex": skill, "$options": "i"}}  # Case-insensitive regex
        artisans = []
        async for artisan in db["artisans"].find(query):
            artisan["id"] = str(artisan["_id"])
            artisan.pop("_id", None)
            if "password_hash" in artisan:
                del artisan["password_hash"]
            artisans.append(artisan)
        return artisans
    
    @staticmethod
    async def get_artisans_by_location(location: str) -> List[Dict[str, Any]]:
        """Get artisans filtered by location"""
        query = {"location": {"$regex": location, "$options": "i"}}  # Case-insensitive regex
        artisans = []
        async for artisan in db["artisans"].find(query):
            artisan["id"] = str(artisan["_id"])
            artisan.pop("_id", None)
            if "password_hash" in artisan:
                del artisan["password_hash"]
            artisans.append(artisan)
        return artisans
    
    @staticmethod
    async def get_artisan_by_id(artisan_id: str) -> Optional[Dict[str, Any]]:
        """Get a single artisan by ID"""
        if not ObjectId.is_valid(artisan_id):
            raise ValueError("Invalid artisan ID")
        
        artisan = await db["artisans"].find_one({"_id": ObjectId(artisan_id)})
        if not artisan:
            return None
        
        artisan["id"] = str(artisan["_id"])
        artisan.pop("_id", None)
        if "password_hash" in artisan:
            del artisan["password_hash"]
        return artisan
    
    @staticmethod
    async def update_artisan_profile(artisan_id: str, updates: ArtisanProfileUpdate) -> Dict[str, Any]:
        """Update artisan profile"""
        if not ObjectId.is_valid(artisan_id):
            raise ValueError("Invalid artisan ID")
        
        update_data = updates.dict(exclude_unset=True)
        if not update_data:
            raise ValueError("No update fields provided")
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db["artisans"].update_one(
            {"_id": ObjectId(artisan_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise ValueError("Artisan not found")
        
        return {"status": "success", "message": "Profile updated successfully"}
    
    @staticmethod
    async def get_artisan_products(artisan_id: str) -> List[Dict[str, Any]]:
        """Get all products for an artisan"""
        if not ObjectId.is_valid(artisan_id):
            raise ValueError("Invalid artisan ID")
        
        products = []
        async for product in db["products"].find({"artisan_id": ObjectId(artisan_id)}):
            product["id"] = str(product["_id"])
            product.pop("_id", None)
            product["artisan_id"] = str(product["artisan_id"])
            products.append(product)
        return products
    
    @staticmethod
    async def add_artisan_product(artisan_id: str, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new product for an artisan"""
        if not ObjectId.is_valid(artisan_id):
            raise ValueError("Invalid artisan ID")
        
        # Check if artisan exists
        artisan = await db["artisans"].find_one({"_id": ObjectId(artisan_id)})
        if not artisan:
            raise ValueError("Artisan not found")
        
        product = {
            "artisan_id": ObjectId(artisan_id),
            "name": product_data.get("name"),
            "description": product_data.get("description"),
            "price": product_data.get("price"),
            "category": product_data.get("category"),
            "images": product_data.get("images", []),
            "availability": product_data.get("availability", True),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db["products"].insert_one(product)
        return {
            "status": "success", 
            "message": "Product added successfully",
            "product_id": str(result.inserted_id)
        }
    
    @staticmethod
    async def delete_artisan_product(artisan_id: str, product_id: str) -> Dict[str, Any]:
        """Delete a product for an artisan"""
        if not ObjectId.is_valid(artisan_id) or not ObjectId.is_valid(product_id):
            raise ValueError("Invalid artisan ID or product ID")
        
        result = await db["products"].delete_one({
            "_id": ObjectId(product_id),
            "artisan_id": ObjectId(artisan_id)
        })
        
        if result.deleted_count == 0:
            raise ValueError("Product not found or doesn't belong to this artisan")
        
        return {"status": "success", "message": "Product deleted successfully"}