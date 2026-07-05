from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException


class FieldError(BaseModel):
    field: str
    message: str


class ApiErrorBody(BaseModel):
    code: str
    message: str
    detail: str | None = None
    field_errors: list[FieldError] | None = None


class ApiErrorResponse(BaseModel):
    error: ApiErrorBody


def _field_path(location: tuple[Any, ...]) -> str:
    parts = [str(part) for part in location if part not in {"body", "query", "path"}]
    return ".".join(parts) if parts else "request"


def _validation_field_errors(exc: RequestValidationError) -> list[FieldError]:
    field_errors: list[FieldError] = []
    for issue in exc.errors():
        field_errors.append(
            FieldError(
                field=_field_path(tuple(issue.get("loc", ()))),
                message=issue.get("msg", "Invalid value"),
            )
        )
    return field_errors


def _http_error_body(exc: HTTPException) -> ApiErrorBody:
    detail = exc.detail
    if isinstance(detail, dict):
        code = str(detail.get("code", "HTTP_ERROR"))
        message = str(detail.get("message", "Request failed"))
        nested_detail = detail.get("detail")
        return ApiErrorBody(
            code=code,
            message=message,
            detail=str(nested_detail) if nested_detail is not None else None,
        )

    message = str(detail) if detail else "Request failed"
    code = {
        400: "BAD_REQUEST",
        404: "NOT_FOUND",
        422: "VALIDATION_ERROR",
        502: "UPSTREAM_ERROR",
        503: "SERVICE_UNAVAILABLE",
    }.get(exc.status_code, "HTTP_ERROR")

    return ApiErrorBody(code=code, message=message, detail=message)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        field_errors = _validation_field_errors(exc)
        body = ApiErrorResponse(
            error=ApiErrorBody(
                code="VALIDATION_ERROR",
                message="Request validation failed",
                field_errors=field_errors,
            )
        )
        return JSONResponse(status_code=422, content=body.model_dump())

    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        _request: Request,
        exc: HTTPException,
    ) -> JSONResponse:
        body = ApiErrorResponse(error=_http_error_body(exc))
        return JSONResponse(status_code=exc.status_code, content=body.model_dump())

    @app.exception_handler(StarletteHTTPException)
    async def starlette_http_exception_handler(
        _request: Request,
        exc: StarletteHTTPException,
    ) -> JSONResponse:
        body = ApiErrorResponse(
            error=ApiErrorBody(
                code="HTTP_ERROR",
                message=str(exc.detail) if exc.detail else "Request failed",
                detail=str(exc.detail) if exc.detail else None,
            )
        )
        return JSONResponse(status_code=exc.status_code, content=body.model_dump())
