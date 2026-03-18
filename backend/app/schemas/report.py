from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.models.report import ReportStatus

class ReportCreate(BaseModel):
    post_id: int | None = None
    comment_id: int | None = None
    reason: str
    description: str | None = None

class ReportOut(BaseModel):
    id: int
    reporter_id: int
    post_id: int | None
    comment_id: int | None
    reason: str
    description: str | None
    status: ReportStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
