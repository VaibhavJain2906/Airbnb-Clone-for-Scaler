from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.services.pricing import PriceQuote


class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests: int = Field(default=1, ge=1)


class BookingRead(BaseModel):
    id: int
    listing_id: int
    listing_title: str
    listing_city: str
    listing_country: str
    listing_image: Optional[str] = None
    guest_id: int
    guest_name: str
    check_in: date
    check_out: date
    guests: int
    nightly_price: float
    nights: int
    cleaning_fee: float
    service_fee: float
    total_price: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingCancelResponse(BaseModel):
    id: int
    status: str
    message: str


PriceQuoteResponse = PriceQuote
