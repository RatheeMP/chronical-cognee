from typing import Any

from app.services.chronicle_engine import run_reasoning_pipeline, to_impact_response


async def analyze_impact(question: str) -> dict[str, Any]:
    result = await run_reasoning_pipeline(question)
    return to_impact_response(result)
