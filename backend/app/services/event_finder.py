from typing import List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from rapidfuzz import fuzz
from fastapi import HTTPException
from app.db import db  # adjust import if needed

def fuzzy_match(a: str, b: str, threshold: int = 70) -> bool:
    if not a or not b:
        return False
    return fuzz.token_set_ratio(a.lower(), b.lower()) >= threshold

def serialize_event(event: dict) -> dict:
    # Convert ObjectId to string for JSON serialization
    if "_id" in event:
        event["_id"] = str(event["_id"])
    return event

async def find_events(
    location: str,
    date: Optional[str] = None,
    db_instance: Optional[AsyncIOMotorDatabase] = None
) -> List[dict]:
    """
    Find events matching location (fuzzy) and optionally date (within event start/end).
    """
    dbi = db_instance or db
    query_date = None
    if date:
        try:
            query_date = datetime.fromisoformat(date).date()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # Fetch all events (for fuzzy matching in Python)
    events_cursor = dbi["events"].find({})
    events = await events_cursor.to_list(length=1000)

    matching_events = []
    for event in events:
        venue = event.get("Venue of Event", "")
        start = event.get("Event Start Date")
        end = event.get("Event End Date")
        try:
            start_date = datetime.fromisoformat(start).date() if start else None
            end_date = datetime.fromisoformat(end).date() if end else None
        except Exception:
            continue

        # Fuzzy match location and (if date given) check date range
        if fuzzy_match(location, venue):
            if query_date:
                if start_date and end_date and start_date <= query_date <= end_date:
                    matching_events.append(serialize_event(event))
            else:
                matching_events.append(serialize_event(event))

    return matching_events