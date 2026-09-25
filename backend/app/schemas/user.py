from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    name: str
    email: str
    avatar_url: Optional[str] = None
    is_host: bool = False
    is_superhost: bool = False


class UserBrief(BaseModel):
    id: int
    name: str
    avatar_url: Optional[str] = None
    is_host: bool = False
    is_superhost: bool = False

    model_config = ConfigDict(from_attributes=True)


class UserRead(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
