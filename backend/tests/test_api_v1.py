from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_v1_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_cors_preflight_allows_json_only_headers():
    response = client.options(
        "/api/v1/memory/impact",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,accept",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert "content-type" in response.headers.get("access-control-allow-headers", "").lower()


def test_legacy_memory_routes_remain_available():
    response = client.post("/memory/recall", json={"query": ""})
    assert response.status_code == 422
