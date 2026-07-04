#!/usr/bin/env python3
"""One-time NovaTech demo dataset seeder for Chronicle.

Populates the configured Cognee dataset with interconnected fictional
organizational memories using the existing memory service (remember API).

Usage (from repo root):
    backend/.venv/Scripts/python.exe backend/scripts/seed_demo_memories.py

Or from backend/:
    .venv/Scripts/python.exe scripts/seed_demo_memories.py
"""

from __future__ import annotations

import asyncio
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config.settings import settings
from app.services import memory_service
from scripts.nova_tech_demo_memories import DATASET_NAME, NOVA_TECH_DEMO_MEMORIES


async def seed_demo_memories() -> int:
    total = len(NOVA_TECH_DEMO_MEMORIES)
    stored = 0
    failures: list[tuple[str, str]] = []
    categories: Counter[str] = Counter()

    print(f"NovaTech demo memory seeder")
    print(f"Target dataset: {settings.cognee_dataset_name or DATASET_NAME}")
    print(f"Memories to store: {total}")
    print("-" * 60)

    for index, memory in enumerate(NOVA_TECH_DEMO_MEMORIES, start=1):
        label = f"[{index}/{total}] {memory.category}"
        try:
            await memory_service.remember_text(memory.text)
            stored += 1
            categories[memory.category] += 1
            print(f"{label} — stored", flush=True)
        except Exception as exc:
            message = str(exc).strip() or exc.__class__.__name__
            failures.append((memory.category, message))
            print(f"{label} — FAILED: {message}", flush=True)

    print("-" * 60)
    print("SEED COMPLETE")
    print(f"Total memories stored: {stored}/{total}")
    print(f"Categories stored ({len(categories)}):")
    for category, count in sorted(categories.items()):
        print(f"  • {category}: {count}")

    if failures:
        print(f"\nFailures ({len(failures)}):")
        for category, error in failures:
            print(f"  • {category}: {error}")
        return 1

    print("\nAll demo memories stored successfully.")
    return 0


def main() -> None:
    exit_code = asyncio.run(seed_demo_memories())
    raise SystemExit(exit_code)


if __name__ == "__main__":
    main()
