import asyncio
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx

from app.config.settings import settings
from app.integrations.cognee.client import CogneeClient
from app.services import memory_service

RUN_ID = f"FORGET_RUN_{uuid.uuid4().hex[:8].upper()}"
DATASET = f"forget_{uuid.uuid4().hex[:8]}"
SECRET = f"ORBIT-{uuid.uuid4().hex[:6].upper()}"
DEMO_MEMORY = (
    f"{RUN_ID}: FORGET_DEMO_SECRET: The project codename is {SECRET}."
)
QUESTION = f"What is the project codename for {RUN_ID}?"


def normalize_text(text: str) -> str:
    return text.lower().replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")


def mentions_secret(text: str) -> bool:
    normalized = normalize_text(text)
    secret_parts = normalize_text(SECRET).split("-")
    return all(part in normalized for part in secret_parts if part)


def extract_answer(results: list) -> str | None:
    for item in results:
        if isinstance(item, dict):
            for key in ("text", "answer", "content"):
                value = item.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()
    return None


def extract_chunk_texts(results: list) -> list[str]:
    texts: list[str] = []
    for item in results:
        if isinstance(item, dict):
            for key in ("text", "content", "answer"):
                value = item.get(key)
                if isinstance(value, str) and value.strip():
                    texts.append(value.strip())
    return texts


async def resolve_data_id(dataset_id: str, marker: str) -> str:
    base = settings.cognee_service_url.rstrip("/")
    headers = {"X-Api-Key": settings.cognee_api_key}

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.get(
            f"{base}/api/v1/datasets/{dataset_id}/data",
            headers=headers,
        )
        response.raise_for_status()
        for item in response.json():
            raw_response = await client.get(
                f"{base}/api/v1/datasets/{dataset_id}/data/{item['id']}/raw",
                headers=headers,
            )
            raw_response.raise_for_status()
            if marker in raw_response.text:
                return item["id"]

    raise RuntimeError("Could not resolve data id for demo memory")


async def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    client = CogneeClient()

    print("Step 1: Storing demo memory...")
    remember_result = await memory_service.remember_text(
        DEMO_MEMORY,
        dataset_name=DATASET,
    )
    if remember_result.get("status") != "completed":
        print(f"Verification failed: remember returned {remember_result.get('status')!r}")
        sys.exit(1)

    dataset_id = remember_result.get("dataset_id")
    if not dataset_id:
        print("Verification failed: remember response missing dataset_id.")
        sys.exit(1)

    data_id = await resolve_data_id(dataset_id, RUN_ID)

    print(f"\nStep 2: Asking Chronicle: {QUESTION!r}")
    answer_before = extract_answer(
        await memory_service.recall_query(QUESTION, dataset_name=DATASET)
    )
    print("\nAnswer before forget:")
    print(answer_before or "(no answer)")

    if not answer_before or not mentions_secret(answer_before):
        print("\nVerification failed: stored memory did not influence the answer.")
        sys.exit(1)

    print("\nStep 3: Forgetting the memory...")
    forget_result = await memory_service.forget_memory(
        dataset_name=DATASET,
        data_id=data_id,
    )
    print(forget_result)

    print(f"\nStep 4: Asking Chronicle again: {QUESTION!r}")
    chunks = await client.recall(QUESTION, dataset_name=DATASET, search_type="CHUNKS")
    chunk_texts = extract_chunk_texts(chunks if isinstance(chunks, list) else [])
    answer_after = extract_answer(
        await memory_service.recall_query(QUESTION, dataset_name=DATASET)
    )

    print("\nRetrieved memory chunks after forget:")
    print(chunk_texts or "(none)")

    print("\nAnswer after forget:")
    print(answer_after or "(no answer)")

    if chunk_texts:
        print("\nVerification failed: forgotten memory is still retrievable.")
        sys.exit(1)

    if any(mentions_secret(text) for text in chunk_texts):
        print("\nVerification failed: forgotten memory still appears in retrieval.")
        sys.exit(1)

    print("\nVerification succeeded.")


if __name__ == "__main__":
    asyncio.run(main())
