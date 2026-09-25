from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=5, max_length=1500)


class ReviewRead(BaseModel):
    id: int
    listing_id: int
    author_id: int
    author_name: str
    author_avatar: Optional[str] = None
    rating: int
    comment: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
