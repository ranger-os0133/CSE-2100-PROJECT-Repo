from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=1)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminRegisterRequest(RegisterRequest):
    admin_code: str


class AdminLoginRequest(LoginRequest):
    admin_code: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
