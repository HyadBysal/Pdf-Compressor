from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class Operation(str, Enum):
    compress = "compress"
    merge = "merge"
    rotate = "rotate"


class JobStatus(str, Enum):
    queued = "QUEUED"
    processing = "PROCESSING"
    completed = "COMPLETED"
    failed = "FAILED"


class CreateJobRequest(BaseModel):
    operation: Operation
    file_ids: list[str] = Field(min_length=1)
    options: dict[str, Any] = {}


class JobResponse(BaseModel):
    job_id: str
    operation: Operation
    file_ids: list[str]
    status: JobStatus
    output_file_id: str | None = None
    error: str | None = None
