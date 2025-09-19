from fastapi import APIRouter, Query
from typing import Optional
from app.services.event_finder import find_events

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/")
async def get_events(
    location: Optional[str] = Query(None, description="Location to search for (fuzzy match)"),
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format (optional)")
):
    """
    Get events by location (fuzzy match) and optionally by date.
    This matches the frontend expectation: GET /events?location=...&date=...
    """
    if not location:
        # If no location provided, return all events
        events = []
        # You can implement get_all_events in event_finder service if needed
        return {"results": events, "count": len(events)}
    
    events = await find_events(location=location, date=date)
    return {"results": events, "count": len(events)}

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