import random
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent))
from reliability_harness import (
    FakeApiError,
    InFlightGuard,
    ReliabilityStats,
    flaky_operation,
    simulate_ask,
    simulate_impact,
    with_transient_retry,
)


def test_transient_cognee_502_recovers_on_retry():
    operation = flaky_operation(
        fail_until_attempt=3,
        error_factory=lambda: FakeApiError("UPSTREAM_ERROR", 502, detail="upstream busy"),
        success_value={"summary": "ok"},
    )

    result = with_transient_retry(operation, sleep_ms=0)
    assert result["summary"] == "ok"


def test_slow_cognee_response_succeeds_without_retry():
    calls = {"count": 0}

    def slow_success() -> str:
        calls["count"] += 1
        return "completed"

    assert with_transient_retry(slow_success, sleep_ms=0) == "completed"
    assert calls["count"] == 1


def test_temporary_network_failure_recovers():
    operation = flaky_operation(
        fail_until_attempt=2,
        error_factory=lambda: ConnectionError("Failed to fetch"),
        success_value={"summary": "ok"},
    )

    assert with_transient_retry(operation, sleep_ms=0)["summary"] == "ok"


def test_render_cold_start_503_recovers():
    operation = flaky_operation(
        fail_until_attempt=2,
        error_factory=lambda: FakeApiError("UPSTREAM_ERROR", 503, detail="service waking"),
        success_value={"summary": "ok"},
    )

    assert with_transient_retry(operation, sleep_ms=0)["summary"] == "ok"


def test_all_retries_exhausted_surfaces_upstream_error():
    def always_fail() -> None:
        raise FakeApiError(
            "UPSTREAM_ERROR",
            502,
            message="Failed to analyze decision impact",
            detail="Cognee Cloud unavailable",
        )

    with pytest.raises(FakeApiError) as exc:
        with_transient_retry(always_fail, sleep_ms=0)

    assert exc.value.code == "UPSTREAM_ERROR"
    assert "Cognee Cloud unavailable" in exc.value.detail


def test_in_flight_guard_blocks_overlapping_requests():
    guard = InFlightGuard()
    started = {"count": 0}

    def operation() -> str:
        started["count"] += 1
        return "ok"

    assert guard.run(operation) == "ok"
    assert guard.run(operation) == "ok"
    guard.active = True
    assert guard.run(operation) is None
    assert started["count"] == 2


def test_50_consecutive_ask_simulations_with_random_transient_failures():
    stats = ReliabilityStats()
    rng = random.Random(42)

    for index in range(50):
        fail_until = rng.randint(1, 3)
        operation = flaky_operation(
            fail_until_attempt=fail_until,
            error_factory=lambda: FakeApiError("UPSTREAM_ERROR", 502, detail="busy"),
            success_value={"summary": f"ask-{index}"},
        )
        result = simulate_ask(f"question-{index}", operation, stats)
        assert result["summary"] == f"ask-{index}"

    assert stats.ask_successes == 50
    assert stats.ask_failures == 0


def test_50_consecutive_impact_simulations_with_random_transient_failures():
    stats = ReliabilityStats()
    rng = random.Random(99)

    for index in range(50):
        fail_until = rng.randint(1, 3)
        operation = flaky_operation(
            fail_until_attempt=fail_until,
            error_factory=lambda: FakeApiError("UPSTREAM_ERROR", 503, detail="cold start"),
            success_value={"summary": f"impact-{index}"},
        )
        result = simulate_impact(f"impact-{index}", operation, stats)
        assert result["summary"] == f"impact-{index}"

    assert stats.impact_successes == 50
    assert stats.impact_failures == 0


def test_retry_events_logged_for_transient_failures():
    stats = ReliabilityStats()
    operation = flaky_operation(
        fail_until_attempt=3,
        error_factory=lambda: FakeApiError("NETWORK_ERROR", 0),
        success_value={"summary": "ok"},
    )

    simulate_impact("impact", operation, stats)
    assert any("retry:1:NETWORK_ERROR" in event for event in stats.retry_events)
