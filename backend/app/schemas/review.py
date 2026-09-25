from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ReviewCreate(BaseModel):
    listing_id: int
    booking_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    cleanliness: Optional[int] = Field(5, ge=1, le=5)
    accuracy: Optional[int] = Field(5, ge=1, le=5)
    communication: Optional[int] = Field(5, ge=1, le=5)
    location: Optional[int] = Field(5, ge=1, le=5)
    value: Optional[int] = Field(5, ge=1, le=5)
    comment: str = Field(..., min_length=3, max_length=1500)


class ReviewRead(BaseModel):
    id: int
    listing_id: int
    author_id: int
    author_name: str
    author_avatar: Optional[str] = None
    rating: int
    cleanliness: Optional[int] = 5
    accuracy: Optional[int] = 5
    communication: Optional[int] = 5
    location: Optional[int] = 5
    value: Optional[int] = 5
    comment: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
