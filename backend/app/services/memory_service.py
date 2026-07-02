from typing import Any

from app.integrations.cognee.client import CogneeClient


async def remember_text(text: str, *, dataset_name: str | None = None) -> Any:
    client = CogneeClient()
    return await client.remember(text, dataset_name=dataset_name)
