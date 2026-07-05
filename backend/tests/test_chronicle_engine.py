import asyncio
from unittest.mock import AsyncMock, patch

from app.services.chronicle_engine import (
    EMPTY_ANSWER,
    RETRIEVAL_PROFILE_DEMO,
    RETRIEVAL_PROFILE_FULL,
    _parse_reasoning_completion,
    expand_retrieval_queries,
    retrieve_and_rank_memories,
    to_impact_response,
)


def test_expand_retrieval_queries_includes_database_variants():
    queries = expand_retrieval_queries("Should we switch our database?")

    assert "Should we switch our database?" in queries
    assert any("postgresql" in query.lower() for query in queries)
    assert any("mongodb" in query.lower() for query in queries)


def test_parse_reasoning_completion_extracts_structured_fields():
    text = (
        "ANSWER: PostgreSQL was chosen for reporting consistency.\n"
        "REASONING: Architecture review and customer interviews emphasized ACID guarantees.\n"
        "RECOMMENDATION: Review previous trade-offs before migrating.\n"
        "CONFIDENCE: high"
    )

    parsed = _parse_reasoning_completion(text)

    assert parsed["answer"] == "PostgreSQL was chosen for reporting consistency."
    assert "Architecture review" in parsed["reasoning"]
    assert parsed["recommendation"] == "Review previous trade-offs before migrating."
    assert parsed["confidence"] == "high"


def test_to_impact_response_maps_unified_pipeline_fields():
    result = {
        "answer": "Enterprise SSO was postponed until onboarding improved.",
        "reasoning": "Product Meeting #12 prioritized onboarding first.",
        "recommendation": "Confirm onboarding metrics before restarting SSO.",
        "confidence": "high",
        "supporting_memories": ["Enterprise SSO was postponed until onboarding redesign is complete."],
        "reasoning_chain": {"nodes": [], "edges": []},
    }

    impact = to_impact_response(result)

    assert impact["summary"] == result["answer"]
    assert impact["reasoning"] == result["reasoning"]
    assert impact["potential_impacts"] == [result["recommendation"]]
    assert impact["supporting_memories"] == result["supporting_memories"]


def test_empty_pipeline_uses_helpful_fallback_copy():
    impact = to_impact_response(
        {
            "answer": EMPTY_ANSWER,
            "reasoning": "",
            "recommendation": "",
            "confidence": "low",
            "supporting_memories": [],
            "reasoning_chain": {"nodes": [], "edges": []},
        }
    )

    assert "couldn't find enough organizational context" in impact["summary"]
    assert "Enterprise SSO" in impact["summary"]


@patch("app.services.chronicle_engine.CogneeClient")
def test_demo_retrieval_profile_limits_passes_and_stops_early(mock_client_cls):
    mock_client = AsyncMock()
    mock_client_cls.return_value = mock_client
    mock_client.recall.return_value = [
        {"text": f"Memory item {index} about database migration and reporting."}
        for index in range(6)
    ]

    asyncio.run(
        retrieve_and_rank_memories(
            "Should we switch our database?",
            retrieval_profile=RETRIEVAL_PROFILE_DEMO,
        )
    )

    assert mock_client.recall.await_count == 1


@patch("app.services.chronicle_engine.CogneeClient")
def test_demo_retrieval_profile_caps_at_two_passes(mock_client_cls):
    mock_client = AsyncMock()
    mock_client_cls.return_value = mock_client
    mock_client.recall.return_value = [
        {"text": f"Memory item {index} about database migration and reporting."}
        for index in range(2)
    ]

    asyncio.run(
        retrieve_and_rank_memories(
            "Should we switch our database?",
            retrieval_profile=RETRIEVAL_PROFILE_DEMO,
        )
    )

    assert mock_client.recall.await_count == 2


@patch("app.services.chronicle_engine.CogneeClient")
def test_full_retrieval_profile_keeps_workspace_limits(mock_client_cls):
    mock_client = AsyncMock()
    mock_client_cls.return_value = mock_client
    mock_client.recall.return_value = [
        {"text": f"Memory item {index} about database migration and reporting."}
        for index in range(2)
    ]

    asyncio.run(
        retrieve_and_rank_memories(
            "Should we switch our database?",
            retrieval_profile=RETRIEVAL_PROFILE_FULL,
        )
    )

    assert mock_client.recall.await_count >= 2
