from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.community import MemberRole


class CommunityCreate(BaseModel):
    name: str
    description: str | None = None


class CommunityOut(BaseModel):
    id: int
    name: str
    description: str | None
    captain_id: int
    member_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MemberOut(BaseModel):
    user_id: int
    username: str
    role: MemberRole
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CommunityPostCreate(BaseModel):
    title: str
    content: str


class CommunityPostOut(BaseModel):
    id: int
    title: str
    content: str
    owner_id: int
    owner_username: str
    community_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
