from datetime import datetime

from pydantic import BaseModel

from app.models.report import ReportStatus
from app.models.user import UserRole


class AdminDashboardStats(BaseModel):
    total_users: int
    active_users: int
    admin_users: int
    total_posts: int
    total_comments: int
    total_reports: int
    pending_reports: int
    reviewed_reports: int
    resolved_reports: int


class AdminReporterOut(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    is_active: bool


class AdminReportOut(BaseModel):
    id: int
    reason: str
    description: str | None
    status: ReportStatus
    created_at: datetime
    reporter: AdminReporterOut
    target_type: str
    target_id: int | None
    target_title: str | None
    target_preview: str | None


class AdminDashboardResponse(BaseModel):
    stats: AdminDashboardStats
    recent_reports: list[AdminReportOut]


class AdminUserStatusUpdate(BaseModel):
    is_active: bool