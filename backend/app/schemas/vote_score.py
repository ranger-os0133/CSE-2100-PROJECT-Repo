from pydantic import BaseModel, ConfigDict
from app.models.vote import VoteType

class VoteScoreOut(BaseModel):
    upvotes: int
    downvotes: int
    score: int
