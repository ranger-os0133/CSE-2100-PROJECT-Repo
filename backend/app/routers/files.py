from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File as FastAPIFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.file import File
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.file import FileOut
from app.utils.storage import delete_imagekit_file, delete_local_file_if_exists, is_allowed_media, save_upload_file

router = APIRouter(prefix="/files", tags=["files"])

@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_file(
    file: UploadFile = FastAPIFile(...),
    post_id: int | None = None,
    message_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not post_id and not message_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either post_id or message_id must be provided"
        )
    
    if not is_allowed_media(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only images, gifs, and videos are allowed"
        )

    try:
        stored_file = save_upload_file(file)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"File upload failed: {exc}"
        ) from exc

    new_file = File(
        filename=file.filename,
        file_path=stored_file.file_path,
        file_url=stored_file.file_url,
        file_size=stored_file.file_size,
        storage_provider=stored_file.storage_provider,
        storage_asset_id=stored_file.storage_asset_id,
        uploader_id=current_user.id,
        post_id=post_id,
        message_id=message_id
    )
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    return {"message": "Successfully uploaded file", "data": FileOut.model_validate(new_file)}

@router.get("/{file_id}", response_model=FileOut)
def get_file(
    file_id: int,
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    return file

@router.get("/user/{user_id}", response_model=list[FileOut])
def list_user_files(
    user_id: int,
    db: Session = Depends(get_db)
):
    files = db.query(File).filter(File.uploader_id == user_id).all()
    return files

@router.delete("/{file_id}", status_code=status.HTTP_200_OK)
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    if file.uploader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this file"
        )

    try:
        if file.storage_provider == "imagekit" and file.storage_asset_id:
            delete_imagekit_file(file.storage_asset_id)
        elif file.storage_provider == "local":
            delete_local_file_if_exists(str(file.file_path))
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"File delete failed: {exc}"
        ) from exc

    db.delete(file)
    db.commit()
    return {"message": "Successfully deleted file"}
