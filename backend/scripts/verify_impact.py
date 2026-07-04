import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import impact_service

QUESTION = "What happens if we restart Enterprise SSO today?"


async def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    print(f"Analyzing decision impact: {QUESTION!r}")
    result = await impact_service.analyze_impact(QUESTION)

    print("\nImpact response:")
    print(json.dumps(result, indent=2))

    if result.get("summary") == "No relevant memory found.":
        print("\nVerification failed: no relevant memory found.")
        sys.exit(1)

    if not result.get("summary"):
        print("\nVerification failed: missing summary.")
        sys.exit(1)

    if not result.get("supporting_memories"):
        print("\nVerification failed: missing supporting memories.")
        sys.exit(1)

    if not result.get("reasoning"):
        print("\nVerification failed: missing reasoning.")
        sys.exit(1)

    if not result.get("potential_impacts"):
        print("\nVerification failed: missing potential impacts.")
        sys.exit(1)

    chain = result.get("reasoning_chain") or {}
    if len(chain.get("nodes") or []) < 2:
        print("\nVerification failed: missing reasoning chain.")
        sys.exit(1)

    print("\nVerification succeeded.")


if __name__ == "__main__":
    asyncio.run(main())
