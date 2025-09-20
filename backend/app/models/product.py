from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
	@classmethod
	def __get_validators__(cls):
		yield cls.validate

	@classmethod
	def validate(cls, v):
		if not ObjectId.is_valid(v):
			raise ValueError("Invalid ObjectId")
		return ObjectId(v)


class ProductInDB(BaseModel):
	id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
	artisan_id: PyObjectId
	name: str
	description: Optional[str] = None
	price: Optional[float] = None
	category: Optional[str] = None
	images: Optional[List[str]] = []
	availability: bool = True
	product_link: Optional[str] = None
	created_at: datetime = Field(default_factory=datetime.utcnow)
	updated_at: datetime = Field(default_factory=datetime.utcnow)

	class Config:
		json_encoders = {ObjectId: str}
		arbitrary_types_allowed = True

class ProductCreate(BaseModel):
	name: str
	description: Optional[str] = None
	price: Optional[float] = None
	category: Optional[str] = None
	images: Optional[List[str]] = []
	availability: Optional[bool] = True
	product_link: Optional[str] = None
