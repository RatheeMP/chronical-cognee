import asyncio
import json
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.integrations.cognee.client import CogneeClient
from app.services import memory_service

RUN_ID = f"EVOLUTION_RUN_{uuid.uuid4().hex[:8].upper()}"
DATASET = f"evolution_{uuid.uuid4().hex[:8]}"
INITIAL_MEMORY = f"{RUN_ID}: Enterprise SSO status is POSTPONED until onboarding redesign completes."
UPDATED_MEMORY = (
    f"{RUN_ID}: Enterprise SSO status is now ACTIVE as of July 2026. "
    "SSO implementation has restarted after onboarding redesign reached 79% completion."
)
QUESTION = f"What is the Enterprise SSO status for {RUN_ID}?"
IMPROVE_INSTRUCTIONS = (
    "Reconcile the graph so Enterprise SSO status reflects the latest ACTIVE status "
    "and supersedes earlier postponement notes."
)

ACTIVE_MARKERS = ("active", "restarted", "79%", "resum")
POSTPONED_MARKERS = ("postpon", "postponed")


def extract_answer(results: list) -> str | None:
    for item in results:
        if isinstance(item, dict):
            for key in ("text", "answer", "content"):
                value = item.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()
    return None


def improve_succeeded(result: dict) -> bool:
    if result.get("status") == "completed":
        return True
    blob = json.dumps(result).lower()
    return "pipelineruncompleted" in blob or '"status":"completed"' in blob


def mentions_markers(text: str, markers: tuple[str, ...]) -> bool:
    lowered = text.lower()
    return any(marker in lowered for marker in markers)


async def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    client = CogneeClient()

    print("Step 1: Storing initial memory...")
    remember_result = await memory_service.remember_text(
        INITIAL_MEMORY,
        dataset_name=DATASET,
    )
    if remember_result.get("status") != "completed":
        print(f"Verification failed: remember returned {remember_result.get('status')!r}")
        sys.exit(1)

    dataset_id = remember_result.get("dataset_id")
    items = remember_result.get("items") or []
    if not dataset_id or not items:
        print("Verification failed: remember response missing dataset_id or items.")
        sys.exit(1)

    data_id = items[-1]["id"]

    print(f"\nStep 2: Asking Chronicle before update: {QUESTION!r}")
    answer_before = extract_answer(
        await memory_service.recall_query(QUESTION, dataset_name=DATASET)
    )
    print("\nAnswer before update:")
    print(answer_before or "(no answer)")

    print("\nStep 3: Updating memory with new information...")
    update_result = await client.update(
        dataset_id=dataset_id,
        data_id=data_id,
        text=UPDATED_MEMORY,
    )
    if not improve_succeeded(update_result):
        print("Verification failed: memory update did not complete.")
        sys.exit(1)

    print("\nStep 4: Running Improve...")
    improve_result = await memory_service.improve_dataset(
        dataset_name=DATASET,
        instructions=IMPROVE_INSTRUCTIONS,
    )
    print(json.dumps(improve_result, indent=2))
    if not improve_succeeded(improve_result):
        print("Verification failed: improve returned unexpected status.")
        sys.exit(1)

    print(f"\nStep 5: Asking Chronicle again: {QUESTION!r}")
    answer_after = extract_answer(
        await memory_service.recall_query(QUESTION, dataset_name=DATASET)
    )
    print("\nAnswer after improve:")
    print(answer_after or "(no answer)")

    if not answer_after:
        print("\nVerification failed: no answer after improve.")
        sys.exit(1)

    if not mentions_markers(answer_after, ACTIVE_MARKERS):
        print("\nVerification failed: answer after improve does not reflect updated knowledge.")
        sys.exit(1)

    if not mentions_markers(answer_before or "", POSTPONED_MARKERS):
        print("\nVerification failed: answer before update did not reflect original knowledge.")
        sys.exit(1)

    if answer_before and answer_before.strip() == answer_after.strip():
        print("\nVerification failed: answer did not change after memory evolution.")
        sys.exit(1)

    print("\nBefore emphasized postponement:", mentions_markers(answer_before or "", POSTPONED_MARKERS))
    print("After reflects active status:", mentions_markers(answer_after, ACTIVE_MARKERS))
    print("\nVerification succeeded.")


if __name__ == "__main__":
    asyncio.run(main())
