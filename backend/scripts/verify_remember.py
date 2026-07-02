import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import memory_service


async def main() -> None:
    result = await memory_service.remember_text(
        "Chronicle milestone three cloud verification memory."
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
