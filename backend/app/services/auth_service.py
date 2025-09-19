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
        # Check if email already exists
        existing_user = await db["users"].find_one({"email": payload.email})
        existing_artisan = await db["artisans"].find_one({"email": payload.email})
        
        if existing_user or existing_artisan:
            raise ValueError("Email already registered")
        
        if payload.user_type == "artisan":
            doc = {
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
            result = await db["artisans"].insert_one(doc)
            doc["_id"] = result.inserted_id
        else:
            doc = {
                "username": payload.username,
                "email": payload.email,
                "password_hash": hash_password(payload.password),
                "user_type": payload.user_type,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            result = await db["users"].insert_one(doc)
            doc["_id"] = result.inserted_id
        
        return {"status": "success", "message": "User created successfully"}
    
    @staticmethod
    async def login_user(payload: LoginRequest) -> Dict[str, Any]:
        # Check both users and artisans collections
        user = await db["users"].find_one({"email": payload.email})
        if not user:
            user = await db["artisans"].find_one({"email": payload.email})
        
        if not user or not verify_password(payload.password, user["password_hash"]):
            raise ValueError("Invalid credentials")
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        if user.get("user_type", "artisan") == "artisan":
            sub_value = user["user_id"]
            user_id_value = user["user_id"]
        else:
            sub_value = str(user["_id"])
            user_id_value = str(user["_id"])
        access_token = create_access_token(
            data={"sub": sub_value, "user_type": user.get("user_type", "artisan")},
            expires_delta=access_token_expires
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user_id_value,
            "user_type": user.get("user_type", "artisan")
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
        else:
            user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise ValueError("User not found")
        user["id"] = str(user.get("_id", user.get("user_id", "")))
        if "password_hash" in user:
            del user["password_hash"]  # Remove password hash from response
        return user