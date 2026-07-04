from pydantic import BaseModel, Field


class RememberRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Plain text to store in memory")


class RecallRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Question to ask Chronicle")


class ImpactRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Decision impact question")


class ImproveRequest(BaseModel):
    dataset_name: str = Field(..., min_length=1, description="Cognee dataset to improve")
    instructions: str | None = Field(
        default=None,
        description="Optional improvement instructions passed to Cognee improve data field",
    )


class ForgetRequest(BaseModel):
    dataset_name: str = Field(..., min_length=1, description="Cognee dataset name")
    data_id: str = Field(..., min_length=1, description="Cognee data item UUID to forget")
