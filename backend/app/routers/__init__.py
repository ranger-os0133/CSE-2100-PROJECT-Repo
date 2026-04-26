from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from app.routers.posts import router as posts_router
from app.routers.users import router as users_router
from app.routers.votes import router as post_votes_router
from app.routers.comment_votes import router as comment_votes_router
from app.routers.comment_routes import router as comments_router
from app.routers.comment_updates import router as comments_updates_router
from app.routers.messages import router as messages_router
from app.routers.files import router as files_router
from app.routers.reports import router as reports_router
from app.routers.communities import router as communities_router

__all__ = [
    'admin_router',
    'auth_router',
    'posts_router',
    'users_router',
    'post_votes_router',
    'comment_votes_router',
    'comments_router',
    'comments_updates_router',
    'messages_router',
    'files_router',
    'reports_router',
    'communities_router',
]
