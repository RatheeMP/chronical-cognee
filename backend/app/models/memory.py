from pydantic import BaseModel, Field


class RememberRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Plain text to store in memory")
