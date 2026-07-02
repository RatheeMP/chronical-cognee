from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.memory import router as memory_router
from app.api.router import api_router
from app.config.settings import settings

app = FastAPI(
    title="Chronicle API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(memory_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Chronicle API"}
