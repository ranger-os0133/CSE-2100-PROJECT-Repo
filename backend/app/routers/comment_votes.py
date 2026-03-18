from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.vote import Vote, VoteType
from app.models.comment import Comment
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.vote_score import VoteScoreOut
from app.schemas.vote import VoteCreate, VoteOut

router = APIRouter(prefix="/votes", tags=["votes"])

@router.post("/comment/{comment_id}", status_code=status.HTTP_201_CREATED)
def vote_comment(
    comment_id: int,
    payload: VoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    existing = db.query(Vote).filter(
        Vote.comment_id == comment_id,
        Vote.user_id == current_user.id
    ).first()
    if existing:
        existing.vote_type = payload.vote_type
        db.commit()
        db.refresh(existing)
        return {"message": "Successfully updated vote", "data": VoteOut.model_validate(existing)}

    vote = Vote(
        comment_id=comment_id,
        user_id=current_user.id,
        vote_type=payload.vote_type
    )
    db.add(vote)
    db.commit()
    db.refresh(vote)
    return {"message": "Successfully voted on comment", "data": VoteOut.model_validate(vote)}

@router.delete("/comment/{comment_id}", status_code=status.HTTP_200_OK)
def unvote_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vote = db.query(Vote).filter(
        Vote.comment_id == comment_id,
        Vote.user_id == current_user.id
    ).first()
    if not vote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vote not found"
        )
    db.delete(vote)
    db.commit()
    return {"message": "Successfully removed vote"}

@router.get("/comment/{comment_id}/score", response_model=VoteScoreOut)
def get_comment_vote_score(
    comment_id: int,
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    upvotes = db.query(func.count(Vote.id)).filter(
        Vote.comment_id == comment_id,
        Vote.vote_type == VoteType.UPVOTE
    ).scalar()
    downvotes = db.query(func.count(Vote.id)).filter(
        Vote.comment_id == comment_id,
        Vote.vote_type == VoteType.DOWNVOTE
    ).scalar()

    return {
        "upvotes": upvotes,
        "downvotes": downvotes,
        "score": upvotes - downvotes
    }
