from typing import Any

from app.integrations.cognee.client import CogneeClient


async def remember_text(text: str, *, dataset_name: str | None = None) -> Any:
    client = CogneeClient()
    return await client.remember(text, dataset_name=dataset_name)


async def recall_query(query: str, *, dataset_name: str | None = None) -> Any:
    client = CogneeClient()
    return await client.recall(query, dataset_name=dataset_name)


async def improve_dataset(
    *,
    dataset_name: str,
    instructions: str | None = None,
) -> Any:
    client = CogneeClient()
    return await client.improve(dataset_name=dataset_name, instructions=instructions)


async def forget_memory(
    *,
    dataset_name: str,
    data_id: str,
) -> Any:
    client = CogneeClient()
    return await client.forget(dataset_name=dataset_name, data_id=data_id)
