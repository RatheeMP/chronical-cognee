from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app

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
