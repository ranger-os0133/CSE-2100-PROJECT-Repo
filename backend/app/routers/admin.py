from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.comment import Comment
from app.models.post import Post
from app.models.report import Report, ReportStatus
from app.models.user import User, UserRole
from app.routers.auth import require_admin
from app.schemas.admin import (
    AdminDashboardResponse,
    AdminDashboardStats,
    AdminReportOut,
    AdminReporterOut,
    AdminUserStatusUpdate,
)
from app.schemas.report import ReportOut, ReportReviewRequest
from app.schemas.user import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


def _serialize_report(report: Report) -> AdminReportOut:
    target_type = "post" if report.post_id else "comment"
    target_id = report.post_id if report.post_id else report.comment_id
    target_title = report.post.title if report.post else None
    if report.post:
        target_preview = report.post.content[:180]
    elif report.comment:
        target_preview = report.comment.content[:180]
    else:
        target_preview = None

    return AdminReportOut(
        id=report.id,
        reason=report.reason,
        description=report.description,
        status=report.status,
        created_at=report.created_at,
        reporter=AdminReporterOut(
            id=report.reporter.id,
            username=report.reporter.username,
            email=report.reporter.email,
            role=report.reporter.role,
            is_active=report.reporter.is_active,
        ),
        target_type=target_type,
        target_id=target_id,
        target_title=target_title,
        target_preview=target_preview,
    )


@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    stats = AdminDashboardStats(
        total_users=db.query(func.count(User.id)).scalar() or 0,
        active_users=db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0,
        admin_users=db.query(func.count(User.id)).filter(User.role == UserRole.ADMIN.value).scalar() or 0,
        total_posts=db.query(func.count(Post.id)).scalar() or 0,
        total_comments=db.query(func.count(Comment.id)).scalar() or 0,
        total_reports=db.query(func.count(Report.id)).scalar() or 0,
        pending_reports=db.query(func.count(Report.id)).filter(Report.status == ReportStatus.PENDING).scalar() or 0,
        reviewed_reports=db.query(func.count(Report.id)).filter(Report.status == ReportStatus.REVIEWED).scalar() or 0,
        resolved_reports=db.query(func.count(Report.id)).filter(Report.status == ReportStatus.RESOLVED).scalar() or 0,
    )

    recent_reports = db.query(Report).options(
        joinedload(Report.reporter),
        joinedload(Report.post),
        joinedload(Report.comment),
    ).order_by(Report.created_at.desc()).limit(6).all()

    return AdminDashboardResponse(
        stats=stats,
        recent_reports=[_serialize_report(report) for report in recent_reports],
    )


@router.get("/reports", response_model=list[AdminReportOut])
def get_admin_reports(
    status_filter: ReportStatus | None = None,
    search: str | None = Query(default=None, min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = db.query(Report).options(
        joinedload(Report.reporter),
        joinedload(Report.post),
        joinedload(Report.comment),
    )

    if status_filter:
        query = query.filter(Report.status == status_filter)

    reports = query.order_by(Report.created_at.desc()).all()
    serialized = [_serialize_report(report) for report in reports]

    if search:
        search_text = search.lower()
        serialized = [
            report for report in serialized
            if search_text in report.reason.lower()
            or (report.description and search_text in report.description.lower())
            or search_text in report.reporter.username.lower()
            or (report.target_title and search_text in report.target_title.lower())
            or (report.target_preview and search_text in report.target_preview.lower())
        ]

    return serialized


@router.patch("/reports/{report_id}", response_model=AdminReportOut)
def update_admin_report(
    report_id: int,
    payload: ReportReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    report = db.query(Report).options(
        joinedload(Report.reporter),
        joinedload(Report.post),
        joinedload(Report.comment),
    ).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    report.status = payload.status
    db.commit()
    db.refresh(report)
    return _serialize_report(report)


@router.get("/users", response_model=list[UserOut])
def get_admin_users(
    search: str | None = Query(default=None, min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = db.query(User).order_by(User.created_at.desc())
    if search:
        like_value = f"%{search}%"
        query = query.filter(
            (User.username.ilike(like_value)) | (User.email.ilike(like_value))
        )
    return query.all()


@router.patch("/users/{user_id}", response_model=UserOut)
def update_admin_user(
    user_id: int,
    payload: AdminUserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if user.id == current_user.id and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own admin account"
        )

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.delete("/posts/{post_id}", status_code=status.HTTP_200_OK)
def delete_admin_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    db.query(Report).filter(Report.post_id == post_id).delete(synchronize_session=False)
    db.delete(post)
    db.commit()
    return {"message": "Post removed by admin"}


@router.delete("/comments/{comment_id}", status_code=status.HTTP_200_OK)
def delete_admin_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    db.query(Report).filter(Report.comment_id == comment_id).delete(synchronize_session=False)
    db.delete(comment)
    db.commit()
    return {"message": "Comment removed by admin"}