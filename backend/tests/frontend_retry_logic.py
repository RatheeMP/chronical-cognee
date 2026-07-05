"""Mirror of frontend/src/lib/api/retry.ts for reliability tests."""

from __future__ import annotations

import time
from typing import Callable, TypeVar

T = TypeVar("T")

MAX_TRANSIENT_RETRIES = 2
RETRY_BASE_DELAY_MS = 1000


def is_transient_failure(error: Exception) -> bool:
    code = getattr(error, "code", None)
    status = getattr(error, "status", 0)

    if code in {"NETWORK_ERROR", "UPSTREAM_ERROR"}:
        return True
    if status in {502, 503, 504}:
        return True
    if isinstance(error, (ConnectionError, TimeoutError)):
        return True
    return False


def retry_delay_ms(attempt: int) -> int:
    return RETRY_BASE_DELAY_MS * (2**attempt)


def with_transient_retry(
    operation: Callable[[], T],
    *,
    max_retries: int = MAX_TRANSIENT_RETRIES,
    sleep_ms: int | None = None,
) -> T:
    last_error: Exception | None = None

    for attempt in range(max_retries + 1):
        try:
            return operation()
        except Exception as error:
            last_error = error
            if attempt >= max_retries or not is_transient_failure(error):
                raise
            delay = sleep_ms if sleep_ms is not None else retry_delay_ms(attempt)
            time.sleep(delay / 1000)

    if last_error is not None:
        raise last_error
    raise RuntimeError("Retry loop exited unexpectedly")
