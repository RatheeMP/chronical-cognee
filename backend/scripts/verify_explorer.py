import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import impact_service, memory_service

MEMORIES = [
    "Customer interviews revealed that users were confused during onboarding.",
    "Product Meeting #12: The team decided to redesign onboarding before implementing enterprise features.",
    "Enterprise SSO was postponed until the onboarding redesign is complete.",
    "Analytics show onboarding completion improved from 41% to 79% after the redesign.",
]

QUESTION = "What happens if we restart Enterprise SSO today?"


async def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    print("Storing demo memories...")
    for index, text in enumerate(MEMORIES, start=1):
        result = await memory_service.remember_text(text)
        status = result.get("status")
        print(f"  {index}. status={status}")
        if status != "completed":
            print(f"Verification failed: remember returned {status!r}")
            sys.exit(1)

    print(f"\nRunning Decision Impact: {QUESTION!r}")
    result = await impact_service.analyze_impact(QUESTION)

    print("\nImpact response:")
    print(json.dumps(result, indent=2))

    chain = result.get("reasoning_chain") or {}
    nodes = chain.get("nodes") or []
    edges = chain.get("edges") or []

    if len(nodes) < 2:
        print("\nVerification failed: reasoning chain must include memories and question.")
        sys.exit(1)

    if nodes[-1].get("type") != "question":
        print("\nVerification failed: final node must be the current question.")
        sys.exit(1)

    if len(edges) != len(nodes) - 1:
        print("\nVerification failed: edges must connect each step in the chain.")
        sys.exit(1)

    memory_nodes = [node for node in nodes if node.get("type") == "memory"]
    if not memory_nodes:
        print("\nVerification failed: no memory nodes in reasoning chain.")
        sys.exit(1)

    unrelated = any("Feature X" in node.get("content", "") for node in memory_nodes)
    if unrelated:
        print("\nVerification failed: unrelated memories appeared in reasoning chain.")
        sys.exit(1)

    print("\nReasoning path:")
    for node in nodes:
        print(f"  - {node.get('title')}")

    print("\nVerification succeeded.")


if __name__ == "__main__":
    asyncio.run(main())
