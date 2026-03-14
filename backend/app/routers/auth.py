from datetime import timedelta, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.utils.auth import hash_password, verify_password, create_access_token, create_refresh_token, decode_access_token, decode_refresh_token

from app.config import settings
from app.schemas.user import RegisterRequest, LoginRequest, LoginResponse, UserOut
    
router = APIRouter(prefix="/auth", tags=["auth"])

security = HTTPBearer()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest,db: Session = Depends(get_db)):
    
    existing_email = db.query(User).filter(User.email == payload.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    existing_username = db.query(User).filter(
        User.username == payload.username
    ).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Create access token
    access_token_expires = timedelta(
        minutes=settings.jwt_access_token_expire_minutes
    )
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    # Create refresh token
    refresh_token_expires = timedelta(
        days=settings.jwt_refresh_token_expire_days
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)},
        expires_delta=refresh_token_expires
    )

    # Store refresh token in database
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.now(timezone.utc) + refresh_token_expires
    )
    db.add(db_refresh_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=LoginResponse)
def refresh_access_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    refresh_token = credentials.credentials
    payload = decode_refresh_token(refresh_token)
    
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Check if refresh token exists in database and is valid
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token
    ).first()
    
    if not db_token or db_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired or invalid"
        )
    
    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new access token
    access_token_expires = timedelta(
        minutes=settings.jwt_access_token_expire_minutes
    )
    new_access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": new_access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user
