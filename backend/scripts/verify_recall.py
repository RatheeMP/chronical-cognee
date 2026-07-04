import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import memory_service

MEMORIES = [
    "Customer interviews revealed that users were confused during onboarding.",
    "The team decided to redesign onboarding before implementing enterprise features.",
    "Enterprise SSO was postponed until the onboarding redesign is complete.",
]

QUESTION = "Why did we postpone Enterprise SSO?"


def extract_answer(results: list) -> str | None:
    for item in results:
        if isinstance(item, dict):
            for key in ("text", "answer", "content"):
                value = item.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()
    return None


async def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print("Storing three memories via remember endpoint...")
    for index, text in enumerate(MEMORIES, start=1):
        result = await memory_service.remember_text(text)
        status = result.get("status")
        print(f"  {index}. status={status}")
        if status != "completed":
            print(f"Verification failed: remember returned {status!r}")
            sys.exit(1)

    print(f"\nAsking Chronicle: {QUESTION!r}")
    results = await memory_service.recall_query(QUESTION)

    print("\nCognee recall response:")
    print(json.dumps(results, indent=2))

    answer = extract_answer(results)
    if not answer:
        print("\nVerification failed: no answer text in recall response.")
        sys.exit(1)

    print("\nDisplayed answer:")
    print(answer)
    print("\nVerification succeeded.")


if __name__ == "__main__":
    asyncio.run(main())
