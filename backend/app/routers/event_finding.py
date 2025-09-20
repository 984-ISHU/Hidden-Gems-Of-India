from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.event_finder import find_events, find_events_by_date_range, get_all_events

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/find")
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
        events = await get_all_events()
        return {"results": events, "count": len(events)}
    
    events = await find_events(location=location, date=date)
    return {"results": events, "count": len(events)}

@router.get("/by-date-range")
async def get_events_by_date_range(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format (optional, defaults to start_date)"),
    location: Optional[str] = Query(None, description="Location to search for (fuzzy match, optional)")
):
    """
    Get events based on start time and end time, with optional location filter.
    Returns events that overlap with the given date range and optionally match location.
    """
    try:
        events = await find_events_by_date_range(start_date=start_date, end_date=end_date, location=location)
        return {"results": events, "count": len(events)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
async def get_all_events_endpoint():
    """
    Get all events from the database.
    """
    try:
        events = await get_all_events()
        return {"results": events, "count": len(events)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))