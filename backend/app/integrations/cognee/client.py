from typing import Any

import httpx

from app.config.settings import settings


class CogneeClient:
    """HTTP client for the Cognee Cloud tenant REST API."""

    def __init__(
        self,
        *,
        base_url: str | None = None,
        api_key: str | None = None,
        dataset_name: str | None = None,
        timeout: float = 300.0,
    ) -> None:
        self.base_url = (base_url or settings.cognee_service_url).rstrip("/")
        self.api_key = api_key or settings.cognee_api_key
        self.dataset_name = dataset_name or settings.cognee_dataset_name
        self.timeout = timeout

    def _headers(self) -> dict[str, str]:
        return {"X-Api-Key": self.api_key}

    async def remember(
        self,
        text: str,
        *,
        dataset_name: str | None = None,
    ) -> Any:
        """POST /api/v1/remember — multipart file upload per official API."""
        url = f"{self.base_url}/api/v1/remember"
        files = [("data", ("memory.txt", text.encode("utf-8"), "text/plain"))]
        data = {"datasetName": dataset_name or self.dataset_name}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                url,
                headers=self._headers(),
                files=files,
                data=data,
            )
            response.raise_for_status()
            return response.json()
