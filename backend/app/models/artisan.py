from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import uuid

# Helper for MongoDB ObjectId
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


# --------------------
# Artisan DB Schema
# --------------------
class ArtisanInDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))  # UUID like in Postgres
    name: str
    email: EmailStr
    password_hash: str
    phone: Optional[str] = None
    location: Optional[str] = None  # city/district
    bio: Optional[str] = None  # short story
    shop_name: str
    story: Optional[str] = None  # longer story
    skills: Optional[List[str]] = []  # array of crafts
    profile_photo: Optional[str] = None  # store URL/path to photo
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True


class ArtisanProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    shop_name: Optional[str] = None
    story: Optional[str] = None
    skills: Optional[List[str]] = None
    profile_photo: Optional[str] = None

    model_config = ConfigDict(
        extra="forbid"  # disallow unknown fields
    )

# --------------------
# API Response Schema
# --------------------
class ArtisanResponse(BaseModel):
    id: str
    user_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    shop_name: str
    story: Optional[str] = None
    skills: Optional[List[str]] = []
    profile_photo: Optional[str] = None
    created_at: datetime
    updated_at: datetime
