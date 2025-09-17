import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pymongo import MongoClient
import time
import os
from dotenv import load_dotenv
load_dotenv()

BASE_LIST_URL = "https://indian.handicrafts.gov.in/en/events?page={}"
BASE_EVENT_URL = "https://indian.handicrafts.gov.in"
MONGO_URL = os.getenv("MONGO_URL")

def clean_date(text: str):
    if not text:
        return None
    text = text.strip()
    try:
        if "AM" in text or "PM" in text:
            return datetime.strptime(text, "%d/%m/%Y %I:%M %p").isoformat()
        return datetime.strptime(text, "%d/%m/%Y").date().isoformat()
    except Exception:
        return text

def get_event_links_from_page(page_num: int):
    url = BASE_LIST_URL.format(page_num)
    try:
        res = requests.get(url, timeout=10)
        if res.status_code != 200:
            print(f"Failed to fetch listing page {page_num}")
            return []
        soup = BeautifulSoup(res.text, "html.parser")
        links = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.startswith("/en/events/view/"):
                full_url = BASE_EVENT_URL + href
                links.append(full_url)
        return list(set(links))  # Remove duplicates
    except Exception as e:
        print(f"Error fetching links from page {page_num}: {e}")
        return []

def scrape_event(url: str):
    try:
        res = requests.get(url, timeout=10)
        if res.status_code != 200:
            return None
        soup = BeautifulSoup(res.text, "html.parser")
        data = {"_event_url": url}
        for table in soup.find_all("table"):
            for row in table.find_all("tr"):
                th = row.find("th")
                td = row.find("td")
                if th and td:
                    key = th.get_text(strip=True)
                    val = td.get_text(strip=True)
                    if "Date" in key:
                        val = clean_date(val)
                    data[key] = val
        return data if len(data) > 1 else None
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

def scrape_all_events(num_pages=11, max_workers=4):
    # Step 1: Collect all event links
    all_links = set()
    for page in range(1, num_pages + 1):
        links = get_event_links_from_page(page)
        print(f"Found {len(links)} event links on page {page}")
        all_links.update(links)
        time.sleep(0.5)  # Be polite to the server

    print(f"Total unique event links found: {len(all_links)}")

    # Step 2: Scrape all event detail pages in parallel
    results = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {executor.submit(scrape_event, url): url for url in all_links}
        for future in as_completed(future_to_url):
            event_data = future.result()
            if event_data:
                results.append(event_data)
                print(f"Stored event: {event_data.get('Event Title', 'Unknown Title')} at {event_data.get('Venue of Event', 'Unknown Venue')}")
    return results

if __name__ == "__main__":
    all_events = scrape_all_events(num_pages=11, max_workers=4)

    # Save as JSON
    with open("all_events.json", "w", encoding="utf-8") as f:
        json.dump(all_events, f, indent=2, ensure_ascii=False)

    print(f"Total events scraped: {len(all_events)}")

    # --- Push to MongoDB ---
    try:
        client = MongoClient(MONGO_URL)
        db = client["hidden_gems"]
        events_collection = db["events"]
        if all_events:
            events_collection.insert_many(all_events)
            print(f"Inserted {len(all_events)} events into MongoDB collection 'events' in database 'hidden_gems'.")
        else:
            print("No events to insert into MongoDB.")
    except Exception as e:
        print(f"MongoDB insert failed: {e}")