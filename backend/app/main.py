from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError
import os

from app.database import Base, engine
from app import models
from app.routers import (
    admin_router,
    auth_router,
    posts_router,
    users_router,
    post_votes_router,
    comment_votes_router,
    comments_router,
    comments_updates_router,
    messages_router,
    files_router,
    reports_router,
    communities_router,
)
from app.routers.websocket import router as websocket_router
from app.config import settings
from app.utils.storage import UPLOAD_DIR

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="1.0.0")

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    errors = exc.errors()
    for error in errors:
        if "email" in error.get("loc", ()):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Invalid email"}
            )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error"}
    )

@app.get("/")
async def root():
    """Serve the chat HTML file"""
    html_path = os.path.join(os.path.dirname(__file__), "..", "websocket_chat.html")
    if os.path.exists(html_path):
        return FileResponse(html_path, media_type="text/html")
    return {"message": "WebSocket Chat - Open your browser to http://localhost:8000"}

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(posts_router)
app.include_router(users_router)
app.include_router(post_votes_router)
app.include_router(comment_votes_router)
app.include_router(comments_router)
app.include_router(comments_updates_router)
app.include_router(messages_router)
app.include_router(files_router)
app.include_router(reports_router)
app.include_router(communities_router)
app.include_router(websocket_router)