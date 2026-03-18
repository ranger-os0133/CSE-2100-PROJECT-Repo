from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.community import Community, CommunityMember, CommunityPost, MemberRole
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.community import (
    CommunityCreate,
    CommunityOut,
    CommunityPostCreate,
    CommunityPostOut,
    MemberOut,
)

router = APIRouter(prefix="/communities", tags=["communities"])


def _require_member(community_id: int, user: User, db: Session) -> CommunityMember:
    membership = (
        db.query(CommunityMember)
        .filter(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == user.id,
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of this community to perform this action",
        )
    return membership


def _require_captain(community_id: int, user: User, db: Session) -> CommunityMember:
    membership = _require_member(community_id, user, db)
    if membership.role != MemberRole.captain:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the community captain can perform this action",
        )
    return membership


def _build_community_out(community: Community, db: Session) -> CommunityOut:
    member_count = (
        db.query(CommunityMember)
        .filter(CommunityMember.community_id == community.id)
        .count()
    )
    return CommunityOut(
        id=community.id,
        name=community.name,
        description=community.description,
        captain_id=community.captain_id,
        member_count=member_count,
        created_at=community.created_at,
    )


def _build_post_out(post: CommunityPost) -> CommunityPostOut:
    return CommunityPostOut(
        id=post.id,
        title=post.title,
        content=post.content,
        owner_id=post.owner_id,
        owner_username=post.owner.username,
        community_id=post.community_id,
        created_at=post.created_at,
    )


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_community(
    payload: CommunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Community).filter(Community.name == payload.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A community with this name already exists",
        )

    community = Community(
        name=payload.name,
        description=payload.description,
        captain_id=current_user.id,
    )
    db.add(community)
    db.flush()

    captain_membership = CommunityMember(
        community_id=community.id,
        user_id=current_user.id,
        role=MemberRole.captain,
    )
    db.add(captain_membership)
    db.commit()
    db.refresh(community)

    return {"message": "Community created", "data": _build_community_out(community, db)}


@router.get("/", response_model=list[CommunityOut])
def list_communities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    communities = db.query(Community).all()
    return [_build_community_out(c, db) for c in communities]


@router.get("/{community_id}", response_model=CommunityOut)
def get_community(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community not found")
    return _build_community_out(community, db)


@router.post("/{community_id}/join", status_code=status.HTTP_200_OK)
def join_community(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community not found")

    existing = (
        db.query(CommunityMember)
        .filter(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You are already a member"
        )

    membership = CommunityMember(
        community_id=community_id,
        user_id=current_user.id,
        role=MemberRole.member,
    )
    db.add(membership)
    db.commit()
    return {"message": f"Joined community '{community.name}'"}


@router.post("/{community_id}/leave", status_code=status.HTTP_200_OK)
def leave_community(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = (
        db.query(CommunityMember)
        .filter(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id,
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You are not a member of this community"
        )
    if membership.role == MemberRole.captain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captain cannot leave the community. Transfer captaincy or delete the community first",
        )

    db.delete(membership)
    db.commit()
    return {"message": "Left community"}


@router.get("/{community_id}/members", response_model=list[MemberOut])
def list_members(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_member(community_id, current_user, db)
    members = (
        db.query(CommunityMember)
        .filter(CommunityMember.community_id == community_id)
        .all()
    )
    return [
        MemberOut(
            user_id=m.user_id,
            username=m.user.username,
            role=m.role,
            joined_at=m.joined_at,
        )
        for m in members
    ]


@router.post("/{community_id}/transfer-captaincy", status_code=status.HTTP_200_OK)
def transfer_captaincy(
    community_id: int,
    new_captain_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_captain(community_id, current_user, db)

    new_captain_membership = (
        db.query(CommunityMember)
        .filter(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == new_captain_user_id,
        )
        .first()
    )
    if not new_captain_membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The specified user is not a member of this community",
        )

    old_captain_membership = (
        db.query(CommunityMember)
        .filter(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id,
        )
        .first()
    )
    old_captain_membership.role = MemberRole.member
    new_captain_membership.role = MemberRole.captain

    community = db.query(Community).filter(Community.id == community_id).first()
    community.captain_id = new_captain_user_id

    db.commit()
    return {"message": "Captaincy transferred"}


@router.delete("/{community_id}", status_code=status.HTTP_200_OK)
def delete_community(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_captain(community_id, current_user, db)
    community = db.query(Community).filter(Community.id == community_id).first()
    db.delete(community)
    db.commit()
    return {"message": "Community deleted"}


@router.post("/{community_id}/posts", status_code=status.HTTP_201_CREATED)
def create_community_post(
    community_id: int,
    payload: CommunityPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_member(community_id, current_user, db)

    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community not found")

    post = CommunityPost(
        community_id=community_id,
        title=payload.title,
        content=payload.content,
        owner_id=current_user.id,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return {"message": "Post created", "data": _build_post_out(post)}


@router.get("/{community_id}/posts", response_model=list[CommunityPostOut])
def list_community_posts(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_member(community_id, current_user, db)

    posts = (
        db.query(CommunityPost)
        .filter(CommunityPost.community_id == community_id)
        .all()
    )
    return [_build_post_out(p) for p in posts]


@router.get("/{community_id}/posts/{post_id}", response_model=CommunityPostOut)
def get_community_post(
    community_id: int,
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_member(community_id, current_user, db)

    post = (
        db.query(CommunityPost)
        .filter(CommunityPost.id == post_id, CommunityPost.community_id == community_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return _build_post_out(post)


@router.delete("/{community_id}/posts/{post_id}", status_code=status.HTTP_200_OK)
def delete_community_post(
    community_id: int,
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = _require_member(community_id, current_user, db)

    post = (
        db.query(CommunityPost)
        .filter(CommunityPost.id == post_id, CommunityPost.community_id == community_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    if post.owner_id != current_user.id and membership.role != MemberRole.captain:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the post author or the captain can delete this post",
        )

    db.delete(post)
    db.commit()
    return {"message": "Post deleted"}
