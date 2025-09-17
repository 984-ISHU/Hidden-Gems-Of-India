from typing import Optional, Dict
from pydantic import BaseModel, EmailStr, Field
from ..db import db
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: EmailStr
    name: str
    phone: Optional[str] = None

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

def serialize_user(user_dict: Dict) -> Dict:
    """Convert MongoDB document to serializable dictionary"""
    if user_dict and "_id" in user_dict:
        user_dict["_id"] = str(user_dict["_id"])
    return user_dict

async def get_user_by_email(email: str):
    """
    Retrieve user information from the database based on email
    """
    user_collection = db["users"]
    user = await user_collection.find_one({"email": email})
    if user:
        return serialize_user(user)
    return None
