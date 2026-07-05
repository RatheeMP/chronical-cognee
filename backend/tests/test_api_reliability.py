import httpx
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

IMPACT_PAYLOAD = {
    "summary": "Test summary",
    "supporting_memories": [],
    "reasoning": "Test reasoning",
    "potential_impacts": ["Proceed carefully"],
    "reasoning_chain": {"nodes": [], "edges": []},
}


@patch(
    "app.api.v1.memory.impact_service.analyze_impact",
    new_callable=AsyncMock,
)
def test_impact_transient_upstream_fails_immediately_without_client_retry(
    mock_analyze,
):
    """Root cause: a single Cognee/network failure becomes HTTP 502 at the API layer."""
    request = httpx.Request("POST", "https://example.com/recall")
    response = httpx.Response(502, request=request, text="upstream busy")
    mock_analyze.side_effect = httpx.HTTPStatusError(
        "busy",
        request=request,
        response=response,
    )

    result = client.post(
        "/api/v1/memory/impact",
        json={"question": "Should we migrate our database?"},
    )

    assert result.status_code == 502
    assert result.json()["error"]["code"] == "UPSTREAM_ERROR"


@patch(
    "app.api.v1.memory.impact_service.analyze_impact",
    new_callable=AsyncMock,
)
def test_impact_endpoint_succeeds_50_consecutive_requests(mock_analyze):
    mock_analyze.return_value = IMPACT_PAYLOAD

    for index in range(50):
        response = client.post(
            "/api/v1/memory/impact",
            json={"question": f"Should we migrate our database? ({index})"},
        )
        assert response.status_code == 200, response.text
        assert response.json()["summary"] == IMPACT_PAYLOAD["summary"]


@patch(
    "app.api.v1.memory.memory_service.recall_query",
    new_callable=AsyncMock,
)
def test_recall_endpoint_succeeds_50_consecutive_requests(mock_recall):
    mock_recall.return_value = [{"text": "Prior database decision context."}]

    for index in range(50):
        response = client.post(
            "/api/v1/memory/recall",
            json={"query": f"database migration ({index})"},
        )
        assert response.status_code == 200, response.text
        assert response.json()[0]["text"] == "Prior database decision context."
