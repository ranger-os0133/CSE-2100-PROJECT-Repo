from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.post import Post
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.post import PostCreate, PostUpdate, PostOut

router = APIRouter(prefix="/posts", tags=["posts"])

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
    posts = db.query(Post).filter(Post.owner_id == current_user.id).all()
    return [PostOut.model_validate(p) for p in posts]

@router.get("/", response_model=list[PostOut])
def list_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).all()
    return [PostOut.model_validate(p) for p in posts]

@router.get("/user/{author_id}", response_model=list[PostOut])
def get_posts_by_author(author_id: int, db: Session = Depends(get_db)):
    posts = db.query(Post).filter(Post.owner_id == author_id).all()
    if not posts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No posts found for this author"
        )
    return [PostOut.model_validate(p) for p in posts]

@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return PostOut.model_validate(post)

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

    db.delete(post)
    db.commit()
    return {"message": "Successfully deleted post"}
