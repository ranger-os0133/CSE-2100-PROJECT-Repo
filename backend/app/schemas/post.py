from datetime import datetime

from pydantic import BaseModel, ConfigDict
from app.schemas.file import FileOut

class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    is_anonymous: bool = False

class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

class PostOut(PostBase):
    id: int
    display_name: str
    files: list[FileOut] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
