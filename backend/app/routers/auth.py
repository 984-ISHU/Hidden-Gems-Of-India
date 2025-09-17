from fastapi import APIRouter, Depends, HTTPException
from app.db import db
from app.models.auth import SignupRequest, LoginRequest, TokenResponse
from passlib.context import CryptContext
from datetime import datetime
from jose import JWTError, jwt
import os
from uuid import uuid4

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return plain == hashed

def create_token(data: dict) -> str:
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/signup")
async def signup(payload: SignupRequest):
    # Ensure unique email
    existing = await db["users"].find_one({"email": payload.email}) or \
               await db["artisans"].find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if payload.user_type == "artisan":
        doc = {
            "user_id": str(uuid4()),
            "name": payload.username,  # Use username as name
            "email": payload.email,
            "password_hash": hash_password(payload.password),
            "phone": None,
            "location": None,
            "bio": None,
            "shop_name": f"{payload.username}'s Shop",  # Or ask for shop_name in SignupRequest
            "story": None,
            "skills": [],
            "profile_photo": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        await db["artisans"].insert_one(doc)
    else:
        doc = {
            "username": payload.username,
            "email": payload.email,
            "password": hash_password(payload.password),
            "user_type": payload.user_type,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        await db["users"].insert_one(doc)

    return {"status": "success"}

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await db["users"].find_one({"email": payload.email}) or \
           await db["artisans"].find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": str(user["_id"]), "user_type": user["user_type"]})
    return {"access_token": token}