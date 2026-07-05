import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent))
from frontend_retry_logic import is_transient_failure, with_transient_retry


class FakeApiError(Exception):
    def __init__(self, code: str, status: int = 0):
        super().__init__(code)
        self.code = code
        self.status = status


def test_is_transient_failure_detects_upstream_and_network():
    assert is_transient_failure(FakeApiError("UPSTREAM_ERROR", 502))
    assert is_transient_failure(FakeApiError("NETWORK_ERROR", 0))
    assert not is_transient_failure(FakeApiError("VALIDATION_ERROR", 422))


def test_with_transient_retry_recovers_after_two_failures():
    calls = {"count": 0}

    def operation():
        calls["count"] += 1
        if calls["count"] < 3:
            raise FakeApiError("UPSTREAM_ERROR", 502)
        return "ok"

    assert with_transient_retry(operation, max_retries=2, sleep_ms=0) == "ok"
    assert calls["count"] == 3


def test_with_transient_retry_does_not_retry_validation_errors():
    calls = {"count": 0}

    def operation():
        calls["count"] += 1
        raise FakeApiError("VALIDATION_ERROR", 422)

    with pytest.raises(FakeApiError):
        with_transient_retry(operation, max_retries=2)

    assert calls["count"] == 1
