from typing import Any

from app.services.chronicle_engine import run_reasoning_pipeline, to_impact_response


async def analyze_impact(
    question: str,
    *,
    retrieval_profile: str = "full",
) -> dict[str, Any]:
    guided_demo = retrieval_profile == "demo"
    result = await run_reasoning_pipeline(question, guided_demo=guided_demo)
    return to_impact_response(result)
