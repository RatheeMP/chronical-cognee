import re
from typing import Any

from app.integrations.cognee.client import CogneeClient
from app.services.reasoning_service import (
    build_reasoning_chain,
    filter_relevant_memories,
    parse_memory_items,
)

MEMORY_ONLY = (
    "Use only information present in the knowledge graph. "
    "Do not invent facts or predict the future."
)


def _extract_texts(results: Any) -> list[str]:
    if not isinstance(results, list):
        return []

    texts: list[str] = []
    seen: set[str] = set()

    for item in results:
        if not isinstance(item, dict):
            continue
        for key in ("text", "answer", "content"):
            value = item.get(key)
            if isinstance(value, str):
                text = value.strip()
                if text and text not in seen:
                    seen.add(text)
                    texts.append(text)

    return texts


def _first_text(results: Any) -> str:
    texts = _extract_texts(results)
    return texts[0] if texts else ""


def _parse_impacts(text: str) -> list[str]:
    impacts: list[str] = []
    for line in text.splitlines():
        cleaned = re.sub(r"^[-*•\d.)]+\s*", "", line.strip())
        if cleaned:
            impacts.append(cleaned)
    return impacts


async def analyze_impact(question: str) -> dict[str, Any]:
    client = CogneeClient()

    chunk_results = await client.recall(question, search_type="CHUNKS")
    memory_items = parse_memory_items(chunk_results)
    relevant_memories = filter_relevant_memories(memory_items, question)
    supporting_memories = [memory["content"] for memory in relevant_memories]
    reasoning_chain = build_reasoning_chain(question, relevant_memories)

    summary = _first_text(
        await client.recall(
            question,
            search_type="GRAPH_COMPLETION",
            system_prompt=f"Provide a brief summary. {MEMORY_ONLY}",
        )
    )

    reasoning = _first_text(
        await client.recall(
            question,
            search_type="GRAPH_COMPLETION",
            system_prompt=(
                "Explain how the remembered facts connect to this question. "
                f"{MEMORY_ONLY}"
            ),
        )
    )

    impacts_text = _first_text(
        await client.recall(
            question,
            search_type="GRAPH_COMPLETION",
            system_prompt=(
                "List logical consequences that follow from the remembered facts. "
                "One consequence per line. "
                f"{MEMORY_ONLY}"
            ),
        )
    )
    potential_impacts = _parse_impacts(impacts_text)

    if not any([summary, supporting_memories, reasoning, potential_impacts]):
        return {
            "summary": "No relevant memory found.",
            "supporting_memories": [],
            "reasoning": "",
            "potential_impacts": [],
            "reasoning_chain": {"nodes": [], "edges": []},
        }

    return {
        "summary": summary,
        "supporting_memories": supporting_memories,
        "reasoning": reasoning,
        "potential_impacts": potential_impacts,
        "reasoning_chain": reasoning_chain,
    }
