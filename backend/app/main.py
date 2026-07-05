from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.errors import register_exception_handlers
from app.api.router import api_router
from app.api.v1.memory import router as memory_router
from app.config.settings import settings

app = FastAPI(
    title="Chronicle API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
    expose_headers=["Content-Type"],
)

app.include_router(api_router)

# Legacy unversioned routes — kept for backward compatibility during migration.
app.include_router(memory_router, include_in_schema=False)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Chronicle API", "version": "1.0.0"}
