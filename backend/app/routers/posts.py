from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.comment import Comment
from app.models.report import Report
from app.models.post import Post
from app.models.user import User
from app.models.vote import Vote, VoteType
from app.routers.auth import get_current_user
from app.schemas.post import PostCreate, PostUpdate, PostOut

router = APIRouter(prefix="/posts", tags=["posts"])


def _post_metrics_subqueries(db: Session):
    vote_score_subquery = (
        db.query(
            Vote.post_id.label("post_id"),
            func.coalesce(
                func.sum(
                    case(
                        (Vote.vote_type == VoteType.UPVOTE, 1),
                        (Vote.vote_type == VoteType.DOWNVOTE, -1),
                        else_=0,
                    )
                ),
                0,
            ).label("score"),
        )
        .filter(Vote.post_id.isnot(None))
        .group_by(Vote.post_id)
        .subquery()
    )

    comment_count_subquery = (
        db.query(
            Comment.post_id.label("post_id"),
            func.count(Comment.id).label("comment_count"),
        )
        .group_by(Comment.post_id)
        .subquery()
    )

    return vote_score_subquery, comment_count_subquery


def _serialize_post(post: Post, score: int = 0, comment_count: int = 0):
    payload = PostOut.model_validate(post).model_dump()
    payload["score"] = int(score or 0)
    payload["comment_count"] = int(comment_count or 0)
    return payload


def _query_posts_with_metrics(
    db: Session,
    *,
    author_id: int | None = None,
    post_id: int | None = None,
    skip: int = 0,
    limit: int | None = None,
):
    vote_score_subquery, comment_count_subquery = _post_metrics_subqueries(db)

    query = (
        db.query(
            Post,
            func.coalesce(vote_score_subquery.c.score, 0).label("score"),
            func.coalesce(comment_count_subquery.c.comment_count, 0).label("comment_count"),
        )
        .options(selectinload(Post.files))
        .outerjoin(vote_score_subquery, vote_score_subquery.c.post_id == Post.id)
        .outerjoin(comment_count_subquery, comment_count_subquery.c.post_id == Post.id)
        .order_by(Post.created_at.desc())
    )

    if author_id is not None:
        query = query.filter(Post.owner_id == author_id)

    if post_id is not None:
        query = query.filter(Post.id == post_id)

    if skip:
        query = query.offset(skip)
    if limit is not None:
        query = query.limit(limit)

    return query.all()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    display_name = current_user.username
    if hasattr(payload, "is_anonymous") and payload.is_anonymous:
        display_name = "shadowyfig"
    post = Post(
        title=payload.title,
        content=payload.content,
        owner_id=current_user.id,
        is_anonymous=getattr(payload, "is_anonymous", False),
        display_name=display_name
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return {"message": "Successfully created post", "data": PostOut.model_validate(post)}

@router.get("/me", response_model=list[PostOut])
def get_my_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    posts = _query_posts_with_metrics(db, author_id=current_user.id)
    return [_serialize_post(post, score, comment_count) for post, score, comment_count in posts]

@router.get("/", response_model=list[PostOut])
def list_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    posts = _query_posts_with_metrics(db, skip=skip, limit=limit)
    return [_serialize_post(post, score, comment_count) for post, score, comment_count in posts]

@router.get("/user/{author_id}", response_model=list[PostOut])
def get_posts_by_author(author_id: int, db: Session = Depends(get_db)):
    posts = _query_posts_with_metrics(db, author_id=author_id)
    if not posts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No posts found for this author"
        )
    return [_serialize_post(post, score, comment_count) for post, score, comment_count in posts]

@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    matched = _query_posts_with_metrics(db, post_id=post_id, limit=1)
    if not matched:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    post, score, comment_count = matched[0]
    return _serialize_post(post, score, comment_count)

@router.put("/{post_id}")
def update_post(
    post_id: int,
    payload: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this post"
        )

    if payload.title is not None:
        post.title = payload.title
    if payload.content is not None:
        post.content = payload.content

    db.commit()
    db.refresh(post)
    return {"message": "Successfully updated post", "data": PostOut.model_validate(post)}

@router.delete("/{post_id}", status_code=status.HTTP_200_OK)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post"
        )

    db.query(Report).filter(Report.post_id == post_id).delete(synchronize_session=False)
    db.delete(post)
    db.commit()
    return {"message": "Successfully deleted post"}
