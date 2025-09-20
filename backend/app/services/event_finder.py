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

async def find_events_by_date_range(
    start_date: str,
    end_date: Optional[str] = None,
    location: Optional[str] = None,
    db_instance: Optional[AsyncIOMotorDatabase] = None
) -> List[dict]:
    """
    Find events based on start time and end time, with optional location filter.
    Returns events that overlap with the given date range and optionally match location.
    """
    dbi = db_instance or db
    
    try:
        query_start = datetime.fromisoformat(start_date).date()
        query_end = datetime.fromisoformat(end_date).date() if end_date else query_start
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    
    # Fetch all events and filter by date overlap
    events_cursor = dbi["events"].find({})
    events = await events_cursor.to_list(length=1000)
    
    matching_events = []
    for event in events:
        start = event.get("Event Start Date")
        end = event.get("Event End Date")
        venue = event.get("Venue of Event", "")
        
        try:
            event_start = datetime.fromisoformat(start).date() if start else None
            event_end = datetime.fromisoformat(end).date() if end else None
        except Exception:
            continue
        
        # Check if event dates overlap with query range
        if event_start and event_end:
            # Events overlap if: event_start <= query_end and event_end >= query_start
            if event_start <= query_end and event_end >= query_start:
                # If location is provided, also check location match
                if location:
                    if fuzzy_match(location, venue):
                        matching_events.append(serialize_event(event))
                else:
                    matching_events.append(serialize_event(event))
    
    return matching_events

async def get_all_events(db_instance: Optional[AsyncIOMotorDatabase] = None) -> List[dict]:
    """
    Get all events from the database.
    """
    dbi = db_instance or db
    
    events_cursor = dbi["events"].find({})
    events = await events_cursor.to_list(length=1000)
    
    return [serialize_event(event) for event in events]