from pydantic import BaseModel, EmailStr
from typing import Optional

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    user_type: str  # "artisan" or "customer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    user_type: str