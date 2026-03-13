from datetime import datetime, timezone
import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database import Base

class VoteType(str, enum.Enum):
    UPVOTE = "upvote"
    DOWNVOTE = "downvote"

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True, index=True)
    vote_type = Column(Enum(VoteType), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User")
    post = relationship("Post")
