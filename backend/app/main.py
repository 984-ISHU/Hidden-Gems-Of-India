from fastapi import FastAPI
from app.db import db  # ensures Mongo connection is initialized
<<<<<<< HEAD
from app.routers import artisans, auth
=======
from app.routers import artisans, users
>>>>>>> e8ecfd7c0dc1c210634fe5457fe8e006d6f717c1

app = FastAPI(title="Hidden Gems of India API", version="1.0.0")

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
<<<<<<< HEAD
app.include_router(auth.router, prefix=api_prefix)
# app.include_router(users.router, prefix=api_prefix)
=======
# app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
>>>>>>> e8ecfd7c0dc1c210634fe5457fe8e006d6f717c1
app.include_router(artisans.router, prefix=api_prefix)
# app.include_router(products.router, prefix=api_prefix)
# app.include_router(orders.router, prefix=api_prefix)
# app.include_router(marketing.router, prefix=api_prefix)
# app.include_router(analytics.router, prefix=api_prefix)
# app.include_router(subscriptions.router, prefix=api_prefix)
# app.include_router(connections.router, prefix=api_prefix)
# app.include_router(recommendations.router, prefix=api_prefix)
# app.include_router(assistant.router, prefix=api_prefix)