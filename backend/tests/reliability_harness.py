"""Reliability harness mirroring frontend retry + Ask/Impact client behavior."""

from __future__ import annotations

import random
import time
from dataclasses import dataclass, field
from typing import Callable, TypeVar

T = TypeVar("T")

MAX_TRANSIENT_RETRIES = 2
RETRY_BASE_DELAY_MS = 1000


class FakeApiError(Exception):
    def __init__(self, code: str, status: int = 0, message: str = "", detail: str = ""):
        super().__init__(message or code)
        self.code = code
        self.status = status
        self.message = message or code
        self.detail = detail


def is_transient_failure(error: Exception) -> bool:
    code = getattr(error, "code", None)
    status = getattr(error, "status", 0)
    if code in {"NETWORK_ERROR", "UPSTREAM_ERROR"}:
        return True
    if status in {502, 503, 504}:
        return True
    if isinstance(error, (ConnectionError, TimeoutError, OSError)):
        return True
    return False


def retry_delay_ms(attempt: int) -> int:
    return RETRY_BASE_DELAY_MS * (2**attempt)


def with_transient_retry(
    operation: Callable[[], T],
    *,
    max_retries: int = MAX_TRANSIENT_RETRIES,
    sleep_ms: int | None = None,
    on_retry: Callable[[int, Exception], None] | None = None,
) -> T:
    last_error: Exception | None = None

    for attempt in range(max_retries + 1):
        try:
            return operation()
        except Exception as error:
            last_error = error
            if attempt >= max_retries or not is_transient_failure(error):
                raise
            if on_retry:
                on_retry(attempt + 1, error)
            delay = sleep_ms if sleep_ms is not None else retry_delay_ms(attempt)
            time.sleep(delay / 1000)

    if last_error is not None:
        raise last_error
    raise RuntimeError("Retry loop exited unexpectedly")


@dataclass
class InFlightGuard:
    active: bool = False
    executions: int = 0

    def run(self, operation: Callable[[], T]) -> T | None:
        if self.active:
            return None
        self.active = True
        self.executions += 1
        try:
            return operation()
        finally:
            self.active = False


@dataclass
class ReliabilityStats:
    ask_successes: int = 0
    impact_successes: int = 0
    ask_failures: int = 0
    impact_failures: int = 0
    retry_events: list[str] = field(default_factory=list)


def simulate_ask(question: str, operation: Callable[[], dict], stats: ReliabilityStats) -> dict:
    def on_retry(attempt: int, error: Exception) -> None:
        stats.retry_events.append(f"ask:{question}:retry:{attempt}:{error.code}")

    try:
        result = with_transient_retry(operation, sleep_ms=0, on_retry=on_retry)
        stats.ask_successes += 1
        return result
    except Exception:
        stats.ask_failures += 1
        raise


def simulate_impact(question: str, operation: Callable[[], dict], stats: ReliabilityStats) -> dict:
    def on_retry(attempt: int, error: Exception) -> None:
        stats.retry_events.append(f"impact:{question}:retry:{attempt}:{error.code}")

    try:
        result = with_transient_retry(operation, sleep_ms=0, on_retry=on_retry)
        stats.impact_successes += 1
        return result
    except Exception:
        stats.impact_failures += 1
        raise


def flaky_operation(
    *,
    fail_until_attempt: int,
    error_factory: Callable[[], Exception],
    success_value: dict,
    slow_ms: int = 0,
) -> Callable[[], dict]:
    state = {"calls": 0}

    def operation() -> dict:
        state["calls"] += 1
        if slow_ms:
            time.sleep(slow_ms / 1000)
        if state["calls"] < fail_until_attempt:
            raise error_factory()
        return success_value

    return operation
