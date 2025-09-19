def serialize_artisan(artisan: dict) -> dict:
    artisan = dict(artisan)  # copy
    artisan["id"] = str(artisan["_id"])
    artisan.pop("_id", None)
    if "password_hash" in artisan:
        artisan.pop("password_hash")
    # Convert dates to ISO format
    for date_field in ["created_at", "updated_at"]:
        if date_field in artisan and artisan[date_field]:
            if hasattr(artisan[date_field], "isoformat"):
                artisan[date_field] = artisan[date_field].isoformat()
            elif isinstance(artisan[date_field], dict) and "$date" in artisan[date_field]:
                from datetime import datetime
                ts = int(artisan[date_field]["$date"]["$numberLong"]) / 1000
                artisan[date_field] = datetime.utcfromtimestamp(ts).isoformat()
    return artisan
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
            artisans.append(serialize_artisan(artisan))
        return artisans
    
    @staticmethod
    async def get_artisans_by_skill(skill: str) -> List[Dict[str, Any]]:
        """Get artisans filtered by skill"""
        query = {"skills": {"$regex": skill, "$options": "i"}}  # Case-insensitive regex
        artisans = []
        async for artisan in db["artisans"].find(query):
            artisans.append(serialize_artisan(artisan))
        return artisans
    
    @staticmethod
    async def get_artisans_by_location(location: str) -> List[Dict[str, Any]]:
        """Get artisans filtered by location"""
        query = {"location": {"$regex": location, "$options": "i"}}  # Case-insensitive regex
        artisans = []
        async for artisan in db["artisans"].find(query):
            artisans.append(serialize_artisan(artisan))
        return artisans
    
    @staticmethod
    async def get_artisan_by_user_id(user_id: str) -> Optional[Dict[str, Any]]:
        """Get a single artisan by user_id"""
        artisan = await db["artisans"].find_one({"user_id": user_id})
        if not artisan:
            return None
        return serialize_artisan(artisan)
    
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
    async def get_artisan_products(user_id: str) -> List[Dict[str, Any]]:
        """Get all products for an artisan by user_id"""
        products = []
        async for product in db["products"].find({"artisan_user_id": user_id}):
            product["id"] = str(product["_id"])
            product.pop("_id", None)
            product["artisan_user_id"] = str(product["artisan_user_id"])
            # Convert dates to ISO format
            for date_field in ["created_at", "updated_at"]:
                if date_field in product and product[date_field]:
                    if hasattr(product[date_field], "isoformat"):
                        product[date_field] = product[date_field].isoformat()
                    elif isinstance(product[date_field], dict) and "$date" in product[date_field]:
                        from datetime import datetime
                        ts = int(product[date_field]["$date"]["$numberLong"]) / 1000
                        product[date_field] = datetime.utcfromtimestamp(ts).isoformat()
            products.append(product)
        return products
    
    @staticmethod
    async def add_artisan_product(user_id: str, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new product for an artisan by user_id"""
        # Check if artisan exists
        artisan = await db["artisans"].find_one({"user_id": user_id})
        if not artisan:
            raise ValueError("Artisan not found")
        product = {
            "artisan_user_id": user_id,
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