"""One-off diagnostic: verify impact path prints ENTER/EXIT and Chronicle Timing."""
import asyncio
from unittest.mock import AsyncMock, patch

from app.services.impact_service import analyze_impact


async def main() -> None:
    with patch("app.services.chronicle_engine.CogneeClient") as mock_client_cls:
        client = mock_client_cls.return_value
        client.recall = AsyncMock(
            side_effect=[
                [{"text": "PostgreSQL was chosen for reporting consistency."}],
                [{"text": "Enterprise SSO postponed until onboarding improved."}],
                [
                    {
                        "text": (
                            "ANSWER: Test answer\n"
                            "REASONING: Test reasoning\n"
                            "RECOMMENDATION: Test recommendation\n"
                            "CONFIDENCE: high"
                        )
                    }
                ],
            ]
        )
        await analyze_impact("Should we switch our database?")


if __name__ == "__main__":
    asyncio.run(main())
