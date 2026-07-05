from fastapi import APIRouter

from app.api.v1 import health
from app.api.v1.memory import router as memory_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router, tags=["health"])
api_router.include_router(memory_router)
