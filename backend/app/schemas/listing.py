from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserBrief


class AmenityRead(BaseModel):
    id: int
    name: str
    icon: str

    model_config = ConfigDict(from_attributes=True)


class ListingImageRead(BaseModel):
    id: int
    url: str
    position: int

    model_config = ConfigDict(from_attributes=True)


class ListingCard(BaseModel):
    id: int
    title: str
    property_type: str
    category: str
    city: str
    country: str
    price_per_night: float
    images: List[str] = []
    average_rating: Optional[float] = None
    review_count: int = 0
    is_superhost: bool = False

    model_config = ConfigDict(from_attributes=True)


class ListingDetail(BaseModel):
    id: int
    title: str
    description: str
    property_type: str
    category: str
    city: str
    country: str
    lat: float
    lng: float
    price_per_night: float
    cleaning_fee: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    images: List[str] = []
    amenities: List[AmenityRead] = []
    host: UserBrief
    average_rating: Optional[float] = None
    review_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class ListingCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    property_type: str = Field(..., max_length=50)
    category: str = Field(..., max_length=50)
    city: str = Field(..., max_length=100)
    country: str = Field(..., max_length=100)
    lat: Optional[float] = 0.0
    lng: Optional[float] = 0.0
    price_per_night: float = Field(..., gt=0)
    cleaning_fee: float = Field(default=0.0, ge=0)
    max_guests: int = Field(default=1, ge=1)
    bedrooms: int = Field(default=1, ge=1)
    beds: int = Field(default=1, ge=1)
    bathrooms: float = Field(default=1.0, ge=0.5)
    image_urls: List[str] = Field(default=[], min_length=1)
    amenity_ids: List[int] = Field(default=[])


class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    property_type: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    price_per_night: Optional[float] = Field(None, gt=0)
    cleaning_fee: Optional[float] = Field(None, ge=0)
    max_guests: Optional[int] = Field(None, ge=1)
    bedrooms: Optional[int] = Field(None, ge=1)
    beds: Optional[int] = Field(None, ge=1)
    bathrooms: Optional[float] = Field(None, ge=0.5)
    image_urls: Optional[List[str]] = None
    amenity_ids: Optional[List[int]] = None


class ListingPagination(BaseModel):
    items: List[ListingCard]
    total: int
    page: int
    page_size: int
    total_pages: int


class DateRangeBlocked(BaseModel):
    check_in: str
    check_out: str
