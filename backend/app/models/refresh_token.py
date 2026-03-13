from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base

class RefreshToken(Base):
	__tablename__ = "refresh_tokens"

	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
	token = Column(String(512), unique=True, nullable=False, index=True)
	expires_at = Column(DateTime, nullable=False)
	created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

	user = relationship("User")
