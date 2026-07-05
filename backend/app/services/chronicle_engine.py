import re
import time
from dataclasses import dataclass
from typing import Any

from app.config.settings import settings
from app.integrations.cognee.client import CogneeClient
from app.services.reasoning_service import (
    build_reasoning_chain,
    filter_relevant_memories,
    parse_memory_items,
)

MEMORY_ONLY = (
    "Use only information present in the organizational memories provided below. "
    "Do not invent facts, dates, or decisions. "
    "If the evidence is insufficient, say so explicitly."
)

EMPTY_ANSWER = (
    "I couldn't find enough organizational context to answer confidently.\n\n"
    "Try asking about:\n"
    "• Enterprise SSO\n"
    "• Database decisions\n"
    "• Customer interviews\n"
    "• Analytics migration\n\n"
    "Or add additional memories."
)

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
    "should",
    "would",
    "could",
    "can",
    "did",
    "not",
    "use",
    "using",
}

DOMAIN_EXPANSIONS: list[tuple[re.Pattern[str], list[str]]] = [
    (
        re.compile(
            r"database|postgres|mongo|sql|migrate|switch|storage|acid|reporting|\bdb\b",
            re.I,
        ),
        [
            "database",
            "postgresql",
            "mongodb",
            "architecture",
            "analytics",
            "performance",
            "decision",
            "trade-offs",
            "migration",
            "reporting",
            "integrity",
            "ACID",
        ],
    ),
    (
        re.compile(r"sso|enterprise|auth|login|sign.?on", re.I),
        [
            "enterprise SSO",
            "authentication",
            "onboarding",
            "enterprise features",
            "roadmap",
            "postponed",
        ],
    ),
    (
        re.compile(r"onboarding|completion|metrics|redesign|ux", re.I),
        [
            "onboarding",
            "completion",
            "redesign",
            "metrics",
            "customer interviews",
            "enterprise",
        ],
    ),
    (
        re.compile(r"customer|feedback|interview|roadmap|churn", re.I),
        [
            "customer interview",
            "feedback",
            "roadmap",
            "onboarding",
            "enterprise",
            "security",
            "compliance",
        ],
    ),
    (
        re.compile(r"meeting|product meeting|#12|auth roadmap", re.I),
        [
            "Product Meeting 12",
            "onboarding",
            "enterprise features",
            "authentication roadmap",
            "decision",
        ],
    ),
    (
        re.compile(r"analytics|incident|postmortem|migration|metrics|revenue", re.I),
        [
            "analytics incident",
            "migration",
            "reporting",
            "metrics",
            "postmortem",
            "database",
        ],
    ),
]

RETRIEVAL_TOP_K = 15
RANKED_EVIDENCE_LIMIT = 8
MAX_RETRIEVAL_PASSES = 8


@dataclass(frozen=True)
class RetrievalProfile:
    max_passes: int
    sufficient_candidates: int
    candidate_cap: int


RETRIEVAL_PROFILE_FULL = RetrievalProfile(
    max_passes=MAX_RETRIEVAL_PASSES,
    sufficient_candidates=RETRIEVAL_TOP_K,
    candidate_cap=RETRIEVAL_TOP_K,
)
RETRIEVAL_PROFILE_DEMO = RetrievalProfile(
    max_passes=2,
    sufficient_candidates=6,
    candidate_cap=RANKED_EVIDENCE_LIMIT,
)


def _empty_timings() -> dict[str, float]:
    return {
        "query_expansion": 0.0,
        "retrieval_ms": 0.0,
        "ranking": 0.0,
        "context_build": 0.0,
        "graph_completion": 0.0,
        "parsing": 0.0,
        "total": 0.0,
    }


def _build_performance(timings: dict[str, float]) -> dict[str, int]:
    return {
        "query_expansion_ms": int(round(timings["query_expansion"])),
        "retrieval_ms": int(round(timings["retrieval_ms"])),
        "ranking_ms": int(round(timings["ranking"])),
        "context_build_ms": int(round(timings["context_build"])),
        "graph_completion_ms": int(round(timings["graph_completion"])),
        "parsing_ms": int(round(timings["parsing"])),
        "total_ms": int(round(timings["total"])),
    }


def _attach_performance(result: dict[str, Any], timings: dict[str, float]) -> None:
    if settings.environment == "development":
        result["performance"] = _build_performance(timings)


def _tokenize(text: str) -> set[str]:
    return {
        word.lower()
        for word in re.findall(r"\w+", text)
        if len(word) > 2 and word.lower() not in STOP_WORDS
    }


def expand_retrieval_queries(question: str) -> list[str]:
    trimmed = question.strip()
    if not trimmed:
        return []

    queries: list[str] = [trimmed]
    expanded_terms = set(_tokenize(trimmed))

    for pattern, terms in DOMAIN_EXPANSIONS:
        if pattern.search(trimmed):
            for term in terms:
                for part in term.lower().split():
                    if len(part) > 2:
                        expanded_terms.add(part)

    if expanded_terms:
        queries.append(" ".join(sorted(expanded_terms)))

    if re.search(r"postgres|mongo|database|switch|migrate|sql", trimmed, re.I):
        queries.extend(
            [
                "PostgreSQL MongoDB database architecture decision trade-offs",
                "Why was PostgreSQL chosen over MongoDB?",
                "database decision engineering reporting consistency ACID",
            ]
        )

    if re.search(r"sso|enterprise|onboarding|auth", trimmed, re.I):
        queries.extend(
            [
                "Enterprise SSO onboarding redesign decision postponed",
                "Why did we postpone Enterprise SSO?",
            ]
        )

    if re.search(r"meeting|#12|product meeting", trimmed, re.I):
        queries.append("Product Meeting 12 onboarding enterprise authentication decision")

    if re.search(r"customer|feedback|interview|roadmap", trimmed, re.I):
        queries.append("customer interview feedback onboarding roadmap enterprise")

    if re.search(r"analytics|incident|postmortem|migration", trimmed, re.I):
        queries.append("analytics incident migration reporting database postmortem")

    content_words = sorted(_tokenize(trimmed))[:5]
    if len(content_words) >= 2:
        queries.append(" ".join(content_words))

    unique: list[str] = []
    seen: set[str] = set()
    for query in queries:
        normalized = query.strip()
        if normalized and normalized not in seen:
            seen.add(normalized)
            unique.append(normalized)

    return unique[:MAX_RETRIEVAL_PASSES]


def _extract_completion_text(results: Any) -> str:
    if not isinstance(results, list):
        return ""

    for item in results:
        if not isinstance(item, dict):
            continue
        for key in ("text", "answer", "content"):
            value = item.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

    return ""


def _build_evidence_context(memories: list[dict[str, Any]]) -> str:
    blocks: list[str] = []
    for index, memory in enumerate(memories, start=1):
        title = memory.get("title") or f"Memory {index}"
        content = memory.get("content") or ""
        blocks.append(f"[{index}] {title}\n{content}")
    return "\n\n".join(blocks)


def _build_reasoning_prompt(question: str, evidence_context: str) -> str:
    return (
        "You are Chronicle, an AI Decision Intelligence system.\n\n"
        f"{MEMORY_ONLY}\n\n"
        "ORGANIZATIONAL MEMORIES:\n"
        f"{evidence_context}\n\n"
        "QUESTION:\n"
        f"{question.strip()}\n\n"
        "Respond using exactly this format (each label on its own line):\n"
        "ANSWER: <direct answer grounded only in the memories above>\n"
        "REASONING: <explain how the memories connect to the question>\n"
        "RECOMMENDATION: <actionable guidance based only on the evidence>\n"
        "CONFIDENCE: <high, medium, or low — use low if evidence is weak or incomplete>"
    )


def _parse_reasoning_completion(text: str) -> dict[str, str]:
    fields = {
        "answer": "",
        "reasoning": "",
        "recommendation": "",
        "confidence": "medium",
    }

    if not text.strip():
        return fields

    label_pattern = re.compile(
        r"^(ANSWER|REASONING|RECOMMENDATION|CONFIDENCE):\s*",
        re.I | re.M,
    )
    matches = list(label_pattern.finditer(text))
    if not matches:
        fields["answer"] = text.strip()
        return fields

    for index, match in enumerate(matches):
        label = match.group(1).lower()
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        value = text[start:end].strip()
        if label in fields:
            fields[label] = value

    confidence = fields["confidence"].lower()
    if confidence not in {"high", "medium", "low"}:
        fields["confidence"] = "medium"

    return fields


def _confidence_from_memories(
    memories: list[dict[str, Any]],
    parsed_confidence: str,
) -> str:
    if not memories:
        return "low"
    if len(memories) == 1:
        return "low" if parsed_confidence == "high" else parsed_confidence
    return parsed_confidence


def _fallback_from_evidence(
    question: str,
    memories: list[dict[str, Any]],
) -> dict[str, str]:
    if not memories:
        return {
            "answer": EMPTY_ANSWER,
            "reasoning": "",
            "recommendation": "",
            "confidence": "low",
        }

    titles = ", ".join(memory["title"] for memory in memories[:4])
    primary = memories[0]
    answer = (
        "Based on the available organizational memories, "
        f"{primary['preview']} "
        "The evidence is limited, so treat this as partial context rather than a complete decision record."
    )

    reasoning = (
        f"The retrieved records ({titles}) appear related to your question, "
        "but Chronicle could not perform a full reasoning pass. "
        "Review the cited memories directly before acting."
    )

    return {
        "answer": answer,
        "reasoning": reasoning,
        "recommendation": "Review the supporting evidence and preserve additional context if needed.",
        "confidence": "low",
    }


async def retrieve_and_rank_memories(
    question: str,
    *,
    retrieval_profile: RetrievalProfile = RETRIEVAL_PROFILE_FULL,
    _timings: dict[str, float] | None = None,
) -> list[dict[str, Any]]:
    client = CogneeClient()
    candidates: list[dict[str, Any]] = []
    seen: set[str] = set()

    expand_start = time.perf_counter()
    queries = expand_retrieval_queries(question)[: retrieval_profile.max_passes]
    if _timings is not None:
        _timings["query_expansion"] = (time.perf_counter() - expand_start) * 1000

    for query in queries:
        recall_start = time.perf_counter()
        chunk_results = await client.recall(query, search_type="CHUNKS")
        if _timings is not None:
            _timings["retrieval_ms"] += (time.perf_counter() - recall_start) * 1000

        dedup_start = time.perf_counter()
        for item in parse_memory_items(chunk_results):
            content = item["content"]
            if content in seen:
                continue
            seen.add(content)
            candidates.append(item)
            if len(candidates) >= retrieval_profile.candidate_cap:
                break
        if _timings is not None:
            _timings["retrieval_ms"] += (time.perf_counter() - dedup_start) * 1000

        if len(candidates) >= retrieval_profile.sufficient_candidates:
            break

    rank_start = time.perf_counter()
    ranked = filter_relevant_memories(
        candidates,
        question,
        max_items=RANKED_EVIDENCE_LIMIT,
    )
    if _timings is not None:
        _timings["ranking"] = (time.perf_counter() - rank_start) * 1000

    return ranked


async def run_reasoning_pipeline(
    question: str,
    *,
    guided_demo: bool = False,
) -> dict[str, Any]:
    total_start = time.perf_counter()
    timings = _empty_timings()

    trimmed = question.strip()
    if not trimmed:
        timings["total"] = (time.perf_counter() - total_start) * 1000
        result = {
            "answer": EMPTY_ANSWER,
            "reasoning": "",
            "recommendation": "",
            "confidence": "low",
            "evidence": [],
            "supporting_memories": [],
            "reasoning_chain": {"nodes": [], "edges": []},
        }
        _attach_performance(result, timings)
        return result

    retrieval_profile = RETRIEVAL_PROFILE_DEMO if guided_demo else RETRIEVAL_PROFILE_FULL
    memories = await retrieve_and_rank_memories(
        trimmed,
        retrieval_profile=retrieval_profile,
        _timings=timings,
    )
    reasoning_chain = build_reasoning_chain(trimmed, memories)

    if not memories:
        timings["total"] = (time.perf_counter() - total_start) * 1000
        result = {
            "answer": EMPTY_ANSWER,
            "reasoning": "",
            "recommendation": "",
            "confidence": "low",
            "evidence": [],
            "supporting_memories": [],
            "reasoning_chain": reasoning_chain,
        }
        _attach_performance(result, timings)
        return result

    context_start = time.perf_counter()
    evidence_context = _build_evidence_context(memories)
    system_prompt = _build_reasoning_prompt(trimmed, evidence_context)
    timings["context_build"] = (time.perf_counter() - context_start) * 1000
    client = CogneeClient()

    graph_start = time.perf_counter()
    try:
        completion = await client.recall(
            trimmed,
            search_type="GRAPH_COMPLETION",
            system_prompt=system_prompt,
        )
        timings["graph_completion"] = (time.perf_counter() - graph_start) * 1000

        parse_start = time.perf_counter()
        parsed = _parse_reasoning_completion(_extract_completion_text(completion))
        timings["parsing"] = (time.perf_counter() - parse_start) * 1000
    except Exception:
        timings["graph_completion"] = (time.perf_counter() - graph_start) * 1000
        parsed = _fallback_from_evidence(trimmed, memories)

    if not parsed["answer"]:
        parsed = _fallback_from_evidence(trimmed, memories)

    confidence = _confidence_from_memories(memories, parsed["confidence"])

    if confidence == "low" and not parsed["reasoning"]:
        fallback = _fallback_from_evidence(trimmed, memories)
        parsed["reasoning"] = fallback["reasoning"]

    timings["total"] = (time.perf_counter() - total_start) * 1000

    result = {
        "answer": parsed["answer"],
        "reasoning": parsed["reasoning"],
        "recommendation": parsed["recommendation"],
        "confidence": confidence,
        "evidence": memories,
        "supporting_memories": [memory["content"] for memory in memories],
        "reasoning_chain": reasoning_chain,
    }
    _attach_performance(result, timings)
    return result


def to_impact_response(result: dict[str, Any]) -> dict[str, Any]:
    recommendation = result.get("recommendation") or ""
    potential_impacts = [recommendation] if recommendation else []

    response: dict[str, Any] = {
        "summary": result.get("answer") or EMPTY_ANSWER,
        "supporting_memories": result.get("supporting_memories") or [],
        "reasoning": result.get("reasoning") or "",
        "potential_impacts": potential_impacts,
        "reasoning_chain": result.get("reasoning_chain")
        or {"nodes": [], "edges": []},
    }

    performance = result.get("performance")
    if performance is not None:
        response["performance"] = performance

    return response
