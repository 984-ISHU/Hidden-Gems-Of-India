from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from bson import ObjectId
from app.db import db
from app.models.auth import SignupRequest, LoginRequest
import os
from uuid import uuid4

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

class AuthService:
    @staticmethod
    async def signup_user(payload: SignupRequest) -> Dict[str, Any]:
        # Check if email already exists in users collection
        existing_user = await db["users"].find_one({"email": payload.email})
        
        if existing_user:
            raise ValueError("Email already registered")
        
        # Always store in users collection for authentication
        user_doc = {
            "username": payload.username,
            "email": payload.email,
            "password_hash": hash_password(payload.password),
            "user_type": payload.user_type,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = await db["users"].insert_one(user_doc)
        
        # If artisan, also create detailed profile in artisans collection
        if payload.user_type == "artisan":
            artisan_doc = {
                "user_id": str(uuid4()),
                "name": payload.username,
                "email": payload.email,
                "password_hash": hash_password(payload.password),
                "phone": None,
                "location": None,
                "bio": None,
                "shop_name": f"{payload.username}'s Shop",
                "story": None,
                "skills": [],
                "profile_photo": None,
                "user_type": "artisan",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            await db["artisans"].insert_one(artisan_doc)
        
        return {"status": "success", "message": "User created successfully"}
    
    @staticmethod
    async def login_user(payload: LoginRequest) -> Dict[str, Any]:
        # Check only users collection for authentication
        user = await db["users"].find_one({"email": payload.email})
        
        if not user:
            raise ValueError(f"No user found with email: {payload.email}")
        
        if not verify_password(payload.password, user["password_hash"]):
            raise ValueError("Invalid password")
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        if user.get("user_type") == "artisan":
            # For artisans, get the user_id from artisans collection
            artisan = await db["artisans"].find_one({"email": payload.email})
            if artisan:
                sub_value = artisan["user_id"]
                user_id_value = artisan["user_id"]
            else:
                sub_value = str(user["_id"])
                user_id_value = str(user["_id"])
        else:
            sub_value = str(user["_id"])
            user_id_value = str(user["_id"])
        
        access_token = create_access_token(
            data={"sub": sub_value, "user_type": user.get("user_type", "customer")},
            expires_delta=access_token_expires
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user_id_value,
            "user_type": user.get("user_type", "customer")
        }
    
    @staticmethod
    async def get_current_user(token: str) -> Dict[str, Any]:
        payload = verify_token(token)
        if payload is None:
            raise ValueError("Invalid token")
        
        user_id = payload.get("sub")
        user_type = payload.get("user_type")
        
        if not user_id:
            raise ValueError("Invalid token payload")
        
        # Get user from appropriate collection
        if user_type == "artisan":
            user = await db["artisans"].find_one({"user_id": user_id})
            if user:
                # Use serialize_artisan for proper ObjectId handling
                from app.services.artisan_service import serialize_artisan
                return serialize_artisan(user)
        else:
            user = await db["users"].find_one({"_id": ObjectId(user_id)})
            if user:
                # Serialize user data properly
                user_data = dict(user)
                user_data["id"] = str(user_data["_id"])
                user_data.pop("_id", None)
                if "password_hash" in user_data:
                    del user_data["password_hash"]
                # Convert dates to ISO format
                for date_field in ["created_at", "updated_at"]:
                    if date_field in user_data and user_data[date_field]:
                        if hasattr(user_data[date_field], "isoformat"):
                            user_data[date_field] = user_data[date_field].isoformat()
                return user_data
        
        raise ValueError("User not found")