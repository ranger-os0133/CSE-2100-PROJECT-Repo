from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False, index=True)
    file_url = Column(String(1000), nullable=False)
    file_size = Column(Integer, nullable=False)
    storage_provider = Column(String(32), nullable=False, default="local", server_default="local")
    storage_asset_id = Column(String(255), nullable=True, index=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    uploader = relationship("User")
    post = relationship("Post", back_populates="files")
