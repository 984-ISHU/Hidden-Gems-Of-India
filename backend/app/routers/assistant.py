from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from bson import ObjectId
from typing import List, Dict, Any
from app.services.RAG_chatbot import rag_answer

router = APIRouter(
    prefix="/assistant",
    tags=["assistant"],
    responses={404: {"description": "Not found"}},
)

class ChatRequest(BaseModel):
    query: str
    top_k: int = 3  # Optional parameter with default value

class RetrievedDocument(BaseModel):
    id: str = Field(alias="_id")
    score: float
    text: str

    @field_validator("id", mode="before")
    @classmethod
    def convert_objectid(cls, v: Any) -> str:
        if isinstance(v, ObjectId):
            return str(v)
        return v

class ChatResponse(BaseModel):
    query: str
    retrieved: List[RetrievedDocument]
    answer: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Endpoint to interact with the RAG-powered assistant.
    
    Args:
        request (ChatRequest): Contains the user query and optional top_k parameter
        
    Returns:
        ChatResponse: Contains the original query, retrieved context chunks, and generated answer
    """
    try:
        result = rag_answer(query=request.query, top_k=request.top_k)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat request: {str(e)}"
        )
