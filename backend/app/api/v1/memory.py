from typing import Any

import httpx
from fastapi import APIRouter, HTTPException

from app.models.memory import (
    ForgetRequest,
    ImpactRequest,
    ImproveRequest,
    RecallRequest,
    RememberRequest,
)
from app.services import impact_service, memory_service, reasoning_service

router = APIRouter(prefix="/memory", tags=["memory-v1"])


def _upstream_error(exc: httpx.HTTPError, *, message: str = "Cognee Cloud request failed") -> HTTPException:
    if isinstance(exc, httpx.HTTPStatusError):
        return HTTPException(
            status_code=exc.response.status_code,
            detail={
                "code": "UPSTREAM_ERROR",
                "message": message,
                "detail": exc.response.text,
            },
        )
    return HTTPException(
        status_code=502,
        detail={
            "code": "UPSTREAM_ERROR",
            "message": message,
            "detail": str(exc),
        },
    )


@router.post("/remember")
async def remember_memory(request: RememberRequest) -> Any:
    try:
        return await memory_service.remember_text(request.text)
    except httpx.HTTPError as exc:
        raise _upstream_error(exc, message="Failed to store memory") from exc


@router.post("/improve")
async def improve_memory(request: ImproveRequest) -> Any:
    try:
        return await memory_service.improve_dataset(
            dataset_name=request.dataset_name,
            instructions=request.instructions,
        )
    except httpx.HTTPError as exc:
        raise _upstream_error(exc, message="Failed to improve memory") from exc


@router.post("/forget")
async def forget_memory_item(request: ForgetRequest) -> Any:
    try:
        return await memory_service.forget_memory(
            dataset_name=request.dataset_name,
            data_id=request.data_id,
        )
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "NOT_FOUND",
                    "message": "Memory not found.",
                },
            ) from exc
        raise _upstream_error(exc, message="Failed to forget memory") from exc
    except httpx.HTTPError as exc:
        raise _upstream_error(exc, message="Failed to forget memory") from exc


@router.post("/impact")
async def decision_impact(request: ImpactRequest) -> Any:
    try:
        return await impact_service.analyze_impact(
            request.question,
            retrieval_profile=request.retrieval_profile,
        )
    except httpx.HTTPError as exc:
        raise _upstream_error(exc, message="Failed to analyze decision impact") from exc


@router.post("/explore")
async def explore_memory(request: RecallRequest) -> Any:
    try:
        return await reasoning_service.build_explorer_chain(request.query)
    except httpx.HTTPError as exc:
        raise _upstream_error(exc, message="Failed to explore reasoning path") from exc


@router.post("/recall")
async def recall_memory(request: RecallRequest) -> Any:
    try:
        return await memory_service.recall_query(request.query)
    except httpx.HTTPError as exc:
        raise _upstream_error(exc, message="Failed to recall memory") from exc
