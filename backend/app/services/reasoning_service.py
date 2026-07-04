import re
from typing import Any

STOP_WORDS = {
    "the",
    "and",
    "for",
    "that",
    "this",
    "with",
    "from",
    "what",
    "when",
    "where",
    "why",
    "how",
    "does",
    "will",
    "have",
    "has",
    "was",
    "were",
    "are",
    "our",
    "your",
    "today",
    "happens",
    "happened",
    "about",
}


def _tokenize(text: str) -> set[str]:
    return {
        word.lower()
        for word in re.findall(r"\w+", text)
        if len(word) > 2 and word.lower() not in STOP_WORDS
    }


def _memory_title(text: str) -> str:
    first_line = text.strip().split("\n")[0]
    if ":" in first_line and len(first_line.split(":", 1)[0]) <= 50:
        return first_line.split(":", 1)[0].strip()

    sentence = first_line.split(".")[0].strip()
    if sentence and len(sentence) <= 60:
        return sentence

    return first_line[:57] + "..." if len(first_line) > 60 else first_line


def _preview(text: str, limit: int = 160) -> str:
    compact = " ".join(text.strip().split())
    if len(compact) <= limit:
        return compact
    return f"{compact[: limit - 3]}..."


def _extract_timestamp(item: dict[str, Any]) -> str | None:
    metadata = item.get("metadata")
    if isinstance(metadata, dict):
        for key in ("created_at", "timestamp", "createdAt", "date"):
            value = metadata.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

    for key in ("created_at", "timestamp", "createdAt", "date"):
        value = item.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()

    return None


def _extract_content(item: dict[str, Any]) -> str | None:
    for key in ("text", "content", "answer"):
        value = item.get(key)
        if isinstance(value, str):
            text = value.strip()
            if text:
                return text
    return None


def parse_memory_items(results: Any) -> list[dict[str, Any]]:
    if not isinstance(results, list):
        return []

    items: list[dict[str, Any]] = []
    seen: set[str] = set()

    for index, raw in enumerate(results):
        if not isinstance(raw, dict):
            continue

        content = _extract_content(raw)
        if not content or content in seen:
            continue

        seen.add(content)
        score = raw.get("score")
        items.append(
            {
                "id": str(raw.get("id") or raw.get("data_id") or f"memory-{index}"),
                "title": _memory_title(content),
                "content": content,
                "preview": _preview(content),
                "timestamp": _extract_timestamp(raw),
                "score": float(score) if isinstance(score, (int, float)) else None,
            }
        )

    return items


def _relevance_score(memory: dict[str, Any], question: str) -> float:
    question_tokens = _tokenize(question)
    memory_tokens = _tokenize(memory["content"])
    overlap = len(question_tokens & memory_tokens)
    overlap_ratio = overlap / max(len(question_tokens), 1)

    cognee_score = memory.get("score")
    normalized_score = float(cognee_score) if isinstance(cognee_score, (int, float)) else 0.0

    return (normalized_score * 0.7) + (overlap_ratio * 0.3)


def filter_relevant_memories(
    items: list[dict[str, Any]],
    question: str,
    *,
    max_items: int = 5,
    min_score: float = 0.12,
) -> list[dict[str, Any]]:
    if not items:
        return []

    scored = [(item, _relevance_score(item, question)) for item in items]
    scored.sort(key=lambda pair: pair[1], reverse=True)

    top_score = scored[0][1] if scored else 0.0
    threshold = max(min_score, top_score * 0.72)
    relevant = [item for item, score in scored if score >= threshold][:max_items]
    if not relevant and scored:
        relevant = [scored[0][0]]

    if any(item.get("timestamp") for item in relevant):
        relevant.sort(key=lambda item: item.get("timestamp") or "")

    return relevant


def build_reasoning_chain(question: str, memories: list[dict[str, Any]]) -> dict[str, Any]:
    nodes: list[dict[str, Any]] = []

    for index, memory in enumerate(memories):
        nodes.append(
            {
                "id": memory["id"],
                "type": "memory",
                "title": memory["title"],
                "content": memory["content"],
                "preview": memory["preview"],
                "timestamp": memory.get("timestamp"),
                "order": index,
            }
        )

    nodes.append(
        {
            "id": "current-question",
            "type": "question",
            "title": "Current Question",
            "content": question.strip(),
            "preview": _preview(question.strip()),
            "timestamp": None,
            "order": len(memories),
        }
    )

    edges = [
        {"from": nodes[index]["id"], "to": nodes[index + 1]["id"]}
        for index in range(len(nodes) - 1)
    ]

    return {"nodes": nodes, "edges": edges}


async def build_explorer_chain(question: str) -> dict[str, Any]:
    from app.services.chronicle_engine import retrieve_and_rank_memories

    relevant = await retrieve_and_rank_memories(question)
    chain = build_reasoning_chain(question, relevant)

    return {
        "reasoning_chain": chain,
        "supporting_memories": [memory["content"] for memory in relevant],
    }
