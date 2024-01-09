from fastapi import APIRouter

from app.api.routes import health, match

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(match.router)
