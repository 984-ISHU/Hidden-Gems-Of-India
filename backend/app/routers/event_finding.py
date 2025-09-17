from fastapi import APIRouter, Query
from typing import Optional
from app.services.event_finder import find_events

router = APIRouter(prefix="/events", tags=["Event Finder"])

@router.get("/find")
async def find_events_route(
    location: str = Query(..., description="Location to search for (fuzzy match)"),
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format (optional)")
):
    """
    Find events by location (fuzzy match) and optionally by date.
    """
    events = await find_events(location=location, date=date)
    return {"results": events, "count": len(events)}