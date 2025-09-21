from fastapi import FastAPI
from app.db import db  # ensures Mongo connection is initialized
from app.routers import artisans, auth, product_description, event_finding, marketing_poster, assistant, profile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Hidden Gems of India API", version="1.0.0")


origins = [
    "http://127.0.0.1:5173", 
    "http://localhost:5173",
    "https://hidden-gems-of-india.vercel.app/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use your defined origins list
    allow_credentials=True,
    allow_methods=["*"],     # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],     # Allow all headers
)

@app.on_event("startup")
async def startup_db_client():
    try:
        await db.command("ping")
        print("Database connection established at startup.")
    except Exception as e:
        print(f"Database connection failed at startup: {e}")

@app.get("/health")
async def health_check():
    # Optional: ping MongoDB to confirm connection
    try:
        await db.command("ping")
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": str(e)}

# Register routers with a common prefix
api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(artisans.router, prefix=api_prefix)
app.include_router(product_description.router, prefix=api_prefix)
app.include_router(event_finding.router, prefix=api_prefix)
app.include_router(marketing_poster.router, prefix=api_prefix)
app.include_router(assistant.router, prefix=api_prefix)
app.include_router(profile.router, prefix=api_prefix)