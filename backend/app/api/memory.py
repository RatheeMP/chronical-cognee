from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Request

from app.models.memory import (
    ForgetRequest,
    ImpactRequest,
    ImproveRequest,
    RecallRequest,
    RememberRequest,
)
from app.services import impact_service, memory_service, reasoning_service

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


@router.post("/improve")
async def improve_memory(request: ImproveRequest) -> Any:
    try:
        return await memory_service.improve_dataset(
            dataset_name=request.dataset_name,
            instructions=request.instructions,
        )
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
                detail="Memory not found.",
            ) from exc
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Cognee Cloud request failed: {exc}",
        ) from exc


@router.post("/impact")
async def decision_impact(request: ImpactRequest, http_request: Request) -> Any:
    guided_demo = http_request.headers.get("X-Chronicle-Context") == "guided-demo"
    try:
        return await impact_service.analyze_impact(
            request.question,
            guided_demo=guided_demo,
        )
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


@router.post("/explore")
async def explore_memory(request: RecallRequest) -> Any:
    try:
        return await reasoning_service.build_explorer_chain(request.query)
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


@router.post("/recall")
async def recall_memory(request: RecallRequest) -> Any:
    try:
        return await memory_service.recall_query(request.query)
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
