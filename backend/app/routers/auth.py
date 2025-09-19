from fastapi import APIRouter, Depends, HTTPException, Header
from app.models.auth import SignupRequest, LoginRequest, TokenResponse
from app.services.auth_service import AuthService
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
async def signup(payload: SignupRequest):
    try:
        result = await AuthService.signup_user(payload)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    try:
        result = await AuthService.login_user(payload)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/logout")
async def logout():
    """
    Logout endpoint - since we're using stateless JWT tokens,
    client should just remove the token from storage
    """
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None, convert_underscores=False)):
    # Accept header case-insensitively and handle extra spaces
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    parts = authorization.strip().split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header format. Expected 'Bearer <token>'")
    token = parts[1]
    try:
        user = await AuthService.get_current_user(token)
        return user
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))