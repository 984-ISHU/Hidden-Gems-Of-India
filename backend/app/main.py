from fastapi import FastAPI
from app.db.session import db  # ensures Mongo connection is initialized
from app.routers import (
    auth, users, artisans, products, orders,
    marketing, analytics, subscriptions,
    connections, recommendations, assistant
)

app = FastAPI(title="Hidden Gems of India API", version="1.0.0")

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
app.include_router(users.router, prefix=api_prefix)
app.include_router(artisans.router, prefix=api_prefix)
app.include_router(products.router, prefix=api_prefix)
app.include_router(orders.router, prefix=api_prefix)
app.include_router(marketing.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)
app.include_router(subscriptions.router, prefix=api_prefix)
app.include_router(connections.router, prefix=api_prefix)
app.include_router(recommendations.router, prefix=api_prefix)
app.include_router(assistant.router, prefix=api_prefix)