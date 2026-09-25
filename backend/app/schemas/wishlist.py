from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.listing import ListingCard


class WishlistRead(BaseModel):
    listing_id: int
    listing: ListingCard
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WishlistToggleResponse(BaseModel):
    listing_id: int
    is_saved: bool
    message: str
