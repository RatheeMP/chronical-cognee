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

    async def improve(
        self,
        *,
        dataset_name: str | None = None,
        instructions: str | None = None,
    ) -> Any:
        """POST /api/v1/improve — enrich the knowledge graph."""
        target_dataset = dataset_name or self.dataset_name
        payload: dict[str, Any] = {"datasetName": target_dataset}
        if instructions:
            payload["data"] = instructions

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            improve_url = f"{self.base_url}/api/v1/improve"
            response = await client.post(
                improve_url,
                headers={**self._headers(), "Content-Type": "application/json"},
                json=payload,
            )

            if response.status_code != 404:
                response.raise_for_status()
                return response.json()

            cognify_payload: dict[str, Any] = {"datasets": [target_dataset]}
            if instructions:
                cognify_payload["customPrompt"] = instructions

            cognify_response = await client.post(
                f"{self.base_url}/api/v1/cognify",
                headers={**self._headers(), "Content-Type": "application/json"},
                json=cognify_payload,
            )
            cognify_response.raise_for_status()
            return cognify_response.json()

    async def update(
        self,
        *,
        dataset_id: str,
        data_id: str,
        text: str,
    ) -> Any:
        """PATCH /api/v1/update — replace an existing dataset document."""
        url = f"{self.base_url}/api/v1/update"
        params = {"dataset_id": dataset_id, "data_id": data_id}
        files = [("data", ("memory.txt", text.encode("utf-8"), "text/plain"))]

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.patch(
                url,
                headers=self._headers(),
                params=params,
                files=files,
            )
            response.raise_for_status()
            return response.json()

    async def forget(
        self,
        *,
        dataset_name: str | None = None,
        data_id: str | None = None,
        memory_only: bool = False,
    ) -> Any:
        """POST /api/v1/forget — remove data or clear dataset memory."""
        url = f"{self.base_url}/api/v1/forget"
        payload: dict[str, Any] = {
            "dataset": dataset_name or self.dataset_name,
        }
        if data_id:
            payload["dataId"] = data_id
        if memory_only:
            payload["memoryOnly"] = True

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                url,
                headers={**self._headers(), "Content-Type": "application/json"},
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    async def recall(
        self,
        query: str,
        *,
        dataset_name: str | None = None,
        search_type: str | None = None,
        system_prompt: str | None = None,
    ) -> Any:
        """POST /api/v1/recall — query memory per official API."""
        url = f"{self.base_url}/api/v1/recall"
        payload: dict[str, Any] = {
            "query": query,
            "datasets": [dataset_name or self.dataset_name],
        }
        if search_type:
            payload["searchType"] = search_type
        if system_prompt:
            payload["systemPrompt"] = system_prompt

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                url,
                headers={**self._headers(), "Content-Type": "application/json"},
                json=payload,
            )
            response.raise_for_status()
            return response.json()
