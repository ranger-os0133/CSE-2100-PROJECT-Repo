from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError
import os
from app.database import Base, engine
from app.config import settings
from app.routers import comment_routes, comment_updates, comment_votes,  reports,  votes ,communities,posts, users



Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="1.0.0")

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
async def read_root():
    return {"message": "Welcome to the Nebula API!"}


app.include_router(comment_routes.router)
app.include_router(comment_updates.router)
app.include_router(comment_votes.router)
app.include_router(reports.router)
app.include_router(votes.router)
app.include_router(communities.router)
app.include_router(posts.router)    
app.include_router(users.router)