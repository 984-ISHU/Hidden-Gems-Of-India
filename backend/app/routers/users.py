from fastapi import APIRouter, HTTPException
from typing import Dict
from ..models.user import get_user_by_email
from pydantic import BaseModel, EmailStr

router = APIRouter()
class EmailRequest(BaseModel):
    email: EmailStr

# @router.get("/{email}")
# async def get_user(email: EmailStr) -> Dict:
#     """
#     Get user information by email path parameter
#     """
#     user = await get_user_by_email(email)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user

@router.post("/me")
async def get_current_user(email_request: EmailRequest) -> Dict:
    """
    Get profile of logged-in user using email from request body
    """
    user = await get_user_by_email(email_request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
