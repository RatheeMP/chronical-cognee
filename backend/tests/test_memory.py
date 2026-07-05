from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.services import reasoning_service

client = TestClient(app)


def test_remember_rejects_empty_text():
    response = client.post("/memory/remember", json={"text": ""})
    assert response.status_code == 422


@patch(
    "app.api.memory.memory_service.remember_text",
    new_callable=AsyncMock,
)
def test_remember_returns_cognee_response(mock_remember):
    cognee_response = {
        "status": "completed",
        "dataset_name": "main_dataset",
        "elapsed_seconds": 12.5,
    }
    mock_remember.return_value = cognee_response

    response = client.post(
        "/memory/remember",
        json={"text": "Chronicle milestone three test memory."},
    )

    assert response.status_code == 200
    assert response.json() == cognee_response
    mock_remember.assert_awaited_once_with("Chronicle milestone three test memory.")


@patch(
    "app.api.memory.memory_service.recall_query",
    new_callable=AsyncMock,
)
def test_recall_returns_cognee_response(mock_recall):
    cognee_response = [
        {
            "source": "graph",
            "kind": "graph_completion",
            "search_type": "GRAPH_COMPLETION",
            "text": "Feature X was delayed due to API instability.",
        }
    ]
    mock_recall.return_value = cognee_response

    response = client.post(
        "/memory/recall",
        json={"query": "Why did we delay Feature X?"},
    )

    assert response.status_code == 200
    assert response.json() == cognee_response
    mock_recall.assert_awaited_once_with("Why did we delay Feature X?")


def test_recall_rejects_empty_query():
    response = client.post("/memory/recall", json={"query": ""})
    assert response.status_code == 422


@patch(
    "app.api.memory.impact_service.analyze_impact",
    new_callable=AsyncMock,
)
def test_impact_returns_structured_response(mock_impact):
    impact_response = {
        "summary": "Restarting Enterprise SSO would conflict with the onboarding redesign.",
        "supporting_memories": [
            "Enterprise SSO was postponed until the onboarding redesign is complete.",
        ],
        "reasoning": "The team prioritized onboarding before enterprise features.",
        "potential_impacts": [
            "Enterprise SSO work may proceed before onboarding redesign is finished.",
        ],
        "reasoning_chain": {
            "nodes": [
                {
                    "id": "memory-0",
                    "type": "memory",
                    "title": "Enterprise SSO was postponed",
                    "content": "Enterprise SSO was postponed until the onboarding redesign is complete.",
                    "preview": "Enterprise SSO was postponed until the onboarding redesign is complete.",
                    "timestamp": None,
                    "order": 0,
                },
                {
                    "id": "current-question",
                    "type": "question",
                    "title": "Current Question",
                    "content": "What happens if we restart Enterprise SSO today?",
                    "preview": "What happens if we restart Enterprise SSO today?",
                    "timestamp": None,
                    "order": 1,
                },
            ],
            "edges": [{"from": "memory-0", "to": "current-question"}],
        },
    }
    mock_impact.return_value = impact_response

    response = client.post(
        "/memory/impact",
        json={"question": "What happens if we restart Enterprise SSO today?"},
    )

    assert response.status_code == 200
    assert response.json() == impact_response
    mock_impact.assert_awaited_once_with(
        "What happens if we restart Enterprise SSO today?",
        guided_demo=False,
    )


@patch(
    "app.api.memory.impact_service.analyze_impact",
    new_callable=AsyncMock,
)
def test_impact_uses_guided_demo_retrieval_profile(mock_impact):
    mock_impact.return_value = {
        "summary": "Demo response",
        "supporting_memories": [],
        "reasoning": "",
        "potential_impacts": [],
        "reasoning_chain": {"nodes": [], "edges": []},
    }

    response = client.post(
        "/memory/impact",
        json={"question": "What happens if we restart Enterprise SSO today?"},
        headers={"X-Chronicle-Context": "guided-demo"},
    )

    assert response.status_code == 200
    mock_impact.assert_awaited_once_with(
        "What happens if we restart Enterprise SSO today?",
        guided_demo=True,
    )


def test_impact_rejects_empty_question():
    response = client.post("/memory/impact", json={"question": ""})
    assert response.status_code == 422


@patch(
    "app.api.memory.reasoning_service.build_explorer_chain",
    new_callable=AsyncMock,
)
def test_explore_returns_reasoning_chain(mock_explore):
    explore_response = {
        "reasoning_chain": {
            "nodes": [
                {
                    "id": "memory-0",
                    "type": "memory",
                    "title": "Customer interviews",
                    "content": "Customer interviews revealed onboarding confusion.",
                    "preview": "Customer interviews revealed onboarding confusion.",
                    "timestamp": None,
                    "order": 0,
                },
                {
                    "id": "current-question",
                    "type": "question",
                    "title": "Current Question",
                    "content": "Why did we postpone Enterprise SSO?",
                    "preview": "Why did we postpone Enterprise SSO?",
                    "timestamp": None,
                    "order": 1,
                },
            ],
            "edges": [{"from": "memory-0", "to": "current-question"}],
        },
        "supporting_memories": [
            "Customer interviews revealed onboarding confusion.",
        ],
    }
    mock_explore.return_value = explore_response

    response = client.post(
        "/memory/explore",
        json={"query": "Why did we postpone Enterprise SSO?"},
    )

    assert response.status_code == 200
    assert response.json() == explore_response
    mock_explore.assert_awaited_once_with("Why did we postpone Enterprise SSO?")


def test_filter_relevant_memories_excludes_unrelated():
    items = [
        {
            "id": "1",
            "title": "Enterprise SSO postponed",
            "content": "Enterprise SSO was postponed until onboarding redesign is complete.",
            "preview": "Enterprise SSO was postponed until onboarding redesign is complete.",
            "timestamp": None,
            "score": 0.9,
        },
        {
            "id": "2",
            "title": "Feature X delayed",
            "content": "Feature X launch was postponed until billing sandbox was fixed.",
            "preview": "Feature X launch was postponed until billing sandbox was fixed.",
            "timestamp": None,
            "score": 0.8,
        },
    ]

    relevant = reasoning_service.filter_relevant_memories(
        items,
        "What happens if we restart Enterprise SSO today?",
    )

    assert len(relevant) == 1
    assert "Enterprise SSO" in relevant[0]["content"]


def test_build_reasoning_chain_adds_question_node():
    memories = [
        {
            "id": "memory-0",
            "title": "Customer interviews",
            "content": "Customer interviews revealed onboarding confusion.",
            "preview": "Customer interviews revealed onboarding confusion.",
            "timestamp": None,
        }
    ]

    chain = reasoning_service.build_reasoning_chain(
        "What happens if we restart Enterprise SSO today?",
        memories,
    )

    assert len(chain["nodes"]) == 2
    assert chain["nodes"][-1]["type"] == "question"
    assert chain["edges"] == [{"from": "memory-0", "to": "current-question"}]


@patch(
    "app.api.memory.memory_service.improve_dataset",
    new_callable=AsyncMock,
)
def test_improve_returns_cognee_response(mock_improve):
    cognee_response = {
        "status": "completed",
        "dataset_name": "main_dataset",
        "elapsed_seconds": 18.2,
    }
    mock_improve.return_value = cognee_response

    response = client.post(
        "/memory/improve",
        json={"dataset_name": "main_dataset"},
    )

    assert response.status_code == 200
    assert response.json() == cognee_response
    mock_improve.assert_awaited_once_with(
        dataset_name="main_dataset",
        instructions=None,
    )


@patch(
    "app.api.memory.memory_service.improve_dataset",
    new_callable=AsyncMock,
)
def test_improve_passes_optional_instructions(mock_improve):
    cognee_response = {"status": "completed", "dataset_name": "main_dataset"}
    mock_improve.return_value = cognee_response

    response = client.post(
        "/memory/improve",
        json={
            "dataset_name": "main_dataset",
            "instructions": "Reconcile Enterprise SSO status with latest update.",
        },
    )

    assert response.status_code == 200
    mock_improve.assert_awaited_once_with(
        dataset_name="main_dataset",
        instructions="Reconcile Enterprise SSO status with latest update.",
    )


def test_improve_rejects_empty_dataset_name():
    response = client.post("/memory/improve", json={"dataset_name": ""})
    assert response.status_code == 422


@patch(
    "app.api.memory.memory_service.forget_memory",
    new_callable=AsyncMock,
)
def test_forget_returns_cognee_response(mock_forget):
    cognee_response = {
        "status": "completed",
        "dataset_id": "758de6ff-37e4-5976-9521-0bf08abc1a24",
        "data_id": "8f11bed0-ef6a-5e09-ab94-b67fedb8b79a",
    }
    mock_forget.return_value = cognee_response

    response = client.post(
        "/memory/forget",
        json={
            "dataset_name": "main_dataset",
            "data_id": "8f11bed0-ef6a-5e09-ab94-b67fedb8b79a",
        },
    )

    assert response.status_code == 200
    assert response.json() == cognee_response
    mock_forget.assert_awaited_once_with(
        dataset_name="main_dataset",
        data_id="8f11bed0-ef6a-5e09-ab94-b67fedb8b79a",
    )


@patch(
    "app.api.memory.memory_service.forget_memory",
    new_callable=AsyncMock,
)
def test_forget_not_found_returns_404(mock_forget):
    import httpx

    request = httpx.Request("POST", "https://example.com/api/v1/forget")
    response = httpx.Response(404, request=request, text='{"detail":"Not Found"}')
    mock_forget.side_effect = httpx.HTTPStatusError(
        "Not Found",
        request=request,
        response=response,
    )

    response = client.post(
        "/memory/forget",
        json={
            "dataset_name": "main_dataset",
            "data_id": "00000000-0000-0000-0000-000000000000",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Memory not found."


def test_forget_rejects_empty_fields():
    response = client.post(
        "/memory/forget",
        json={"dataset_name": "", "data_id": ""},
    )
    assert response.status_code == 422
