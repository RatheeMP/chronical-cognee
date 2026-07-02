from typing import Any

import httpx
from fastapi import APIRouter, HTTPException

from app.models.memory import RememberRequest
from app.services import memory_service

router = APIRouter(prefix="/memory", tags=["memory"])


@router.post("/remember")
async def remember_memory(request: RememberRequest) -> Any:
    try:
        return await memory_service.remember_text(request.text)
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Cognee Cloud request failed: {exc}",
        ) from exc
