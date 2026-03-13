from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base

class Post(Base):
	__tablename__ = "posts"

	id = Column(Integer, primary_key=True, index=True)
	title = Column(String(255), nullable=False, index=True)
	content = Column(Text, nullable=False)
	owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
	is_anonymous = Column(Boolean, default=False, nullable=False)
	display_name = Column(String(255), nullable=False, default="")
	created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

	owner = relationship("User")
	files = relationship("File", back_populates="post", cascade="all, delete-orphan")
