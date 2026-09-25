from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.listing import Listing
from app.schemas.listing import ListingDetail, ListingPagination, DateRangeBlocked
from app.schemas.booking import PriceQuoteResponse
from app.services.listing_service import search_listings, get_listing_detail, get_blocked_dates
from app.services.pricing import calculate_price_quote

router = APIRouter(prefix="/listings", tags=["Listings"])


@router.get("", response_model=ListingPagination)
def list_listings(
    location: Optional[str] = Query(None, description="Search term for city, country, or title"),
    check_in: Optional[date] = Query(None, description="Check-in date (YYYY-MM-DD)"),
    check_out: Optional[date] = Query(None, description="Check-out date (YYYY-MM-DD)"),
    guests: Optional[int] = Query(None, ge=1, description="Minimum guest capacity"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price per night"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price per night"),
    property_type: Optional[str] = Query(None, description="Property type filter"),
    category: Optional[str] = Query(None, description="Category filter"),
    amenities: Optional[str] = Query(None, description="Comma-separated amenity IDs"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=50, description="Items per page"),
    db: Session = Depends(get_db),
):
    """Search listings with rich filters and pagination."""
    amenity_ids = None
    if amenities:
        try:
            amenity_ids = [int(x.strip()) for x in amenities.split(",") if x.strip()]
        except ValueError:
            pass

    return search_listings(
        db=db,
        location=location,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        min_price=min_price,
        max_price=max_price,
        property_type=property_type,
        category=category,
        amenity_ids=amenity_ids,
        page=page,
        page_size=page_size,
    )


@router.get("/{listing_id}", response_model=ListingDetail)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    """Fetch complete details for a single listing."""
    return get_listing_detail(listing_id=listing_id, db=db)


@router.get("/{listing_id}/availability", response_model=List[DateRangeBlocked])
def get_listing_availability(listing_id: int, db: Session = Depends(get_db)):
    """Get all confirmed booking date ranges for calendar blocking."""
    return get_blocked_dates(listing_id=listing_id, db=db)


@router.get("/{listing_id}/quote", response_model=PriceQuoteResponse)
def get_price_quote(
    listing_id: int,
    check_in: date = Query(..., description="Check-in date"),
    check_out: date = Query(..., description="Check-out date"),
    db: Session = Depends(get_db),
):
    """Calculate transparent price quotation for a requested stay."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found.",
        )

    try:
        quote = calculate_price_quote(
            nightly_price=listing.price_per_night,
            cleaning_fee=listing.cleaning_fee,
            check_in=check_in,
            check_out=check_out,
        )
        return quote
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
