from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.report import Report, ReportStatus
from app.models.post import Post
from app.models.comment import Comment
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.report import ReportCreate, ReportOut

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not payload.post_id and not payload.comment_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must report either a post or comment"
        )

    if payload.post_id:
        post = db.query(Post).filter(Post.id == payload.post_id).first()
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )

    if payload.comment_id:
        comment = db.query(Comment).filter(Comment.id == payload.comment_id).first()
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )

    report = Report(
        reporter_id=current_user.id,
        post_id=payload.post_id,
        comment_id=payload.comment_id,
        reason=payload.reason,
        description=payload.description
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return {"message": "Successfully created report", "data": ReportOut.model_validate(report)}

@router.get("/", response_model=list[ReportOut])
def list_reports(
    status_filter: ReportStatus | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if status_filter:
        query = query.filter(Report.status == status_filter)
    return query.all()

@router.get("/{report_id}", response_model=ReportOut)
def get_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    return report

@router.put("/{report_id}/review")
def review_report(
    report_id: int,
    new_status: ReportStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    report.status = new_status
    db.commit()
    db.refresh(report)
    return {"message": "Successfully reviewed report", "data": ReportOut.model_validate(report)}

@router.delete("/{report_id}", status_code=status.HTTP_200_OK)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    db.delete(report)
    db.commit()
    return {"message": "Successfully deleted report"}
