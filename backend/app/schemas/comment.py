from datetime import datetime

from pydantic import BaseModel, ConfigDict

class CommentCreate(BaseModel):
    content: str

class CommentUpdate(BaseModel):
    content: str | None = None

class CommentOut(BaseModel):
    id: int
    content: str
    post_id: int
    owner_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
