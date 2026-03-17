from datetime import datetime

from pydantic import BaseModel, ConfigDict

class FileOut(BaseModel):
    id: int
    filename: str
    file_path: str
    file_url: str
    file_size: int
    storage_provider: str
    uploader_id: int
    post_id: int | None
    message_id: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
