from datetime import date
from typing import List, Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.listing import Listing, ListingImage, Amenity, listing_amenities
from app.models.booking import Booking
from app.models.review import Review
from app.schemas.listing import (
    ListingCard,
    ListingDetail,
    ListingPagination,
    DateRangeBlocked,
    AmenityRead,
    ListingImageRead,
)
from app.schemas.user import UserBrief


def _calculate_listing_rating(listing_id: int, db: Session) -> tuple[Optional[float], int]:
    """Calculate average rating and review count for a listing."""
    rating_data = (
        db.query(func.avg(Review.rating), func.count(Review.id))
        .filter(Review.listing_id == listing_id)
        .first()
    )
    avg_rating = round(float(rating_data[0]), 2) if rating_data and rating_data[0] else None
    review_count = int(rating_data[1]) if rating_data and rating_data[1] else 0
    return avg_rating, review_count


def get_listing_card_dto(listing: Listing, db: Session) -> ListingCard:
    """Helper to convert a Listing model into a rich ListingCard DTO with ratings and images."""
    avg_rating, review_count = _calculate_listing_rating(listing.id, db)

    # Ordered images (fallback if none)
    image_urls = [img.url for img in listing.images] if listing.images else [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ]

    return ListingCard(
        id=listing.id,
        title=listing.title,
        property_type=listing.property_type,
        category=listing.category,
        city=listing.city,
        country=listing.country,
        price_per_night=listing.price_per_night,
        images=image_urls,
        average_rating=avg_rating,
        review_count=review_count,
        is_superhost=listing.host.is_superhost if listing.host else False,
    )


def search_listings(
    db: Session,
    location: Optional[str] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    guests: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    property_type: Optional[str] = None,
    category: Optional[str] = None,
    amenity_ids: Optional[List[int]] = None,
    page: int = 1,
    page_size: int = 12,
) -> ListingPagination:
    """
    Search and filter listings with support for:
    - Text location search (city, country, title)
    - Date availability (excluding listings with overlapping confirmed bookings)
    - Guests capacity
    - Price range
    - Property type
    - Category
    - Specific amenities
    - Pagination
    """
    query = db.query(Listing)

    # 1. Location search
    if location and location.strip():
        term = f"%{location.strip()}%"
        query = query.filter(
            or_(
                Listing.city.ilike(term),
                Listing.country.ilike(term),
                Listing.title.ilike(term),
            )
        )

    # 2. Guests capacity
    if guests and guests > 0:
        query = query.filter(Listing.max_guests >= guests)

    # 3. Price range
    if min_price is not None and min_price > 0:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None and max_price > 0:
        query = query.filter(Listing.price_per_night <= max_price)

    # 4. Property type
    if property_type and property_type.strip() and property_type.lower() != "all":
        query = query.filter(Listing.property_type.ilike(property_type.strip()))

    # 5. Category
    if category and category.strip() and category.lower() != "all":
        query = query.filter(Listing.category.ilike(category.strip()))

    # 6. Availability exclusion (check for overlapping confirmed bookings)
    if check_in and check_out:
        if check_out <= check_in:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Check-out date must be strictly after check-in date.",
            )
        # Two bookings overlap when one starts before the other ends and ends after the other starts.
        # Check-out is exclusive, so leaving on this date makes it available to the next guest.
        overlapping_listings_subquery = (
            db.query(Booking.listing_id)
            .filter(
                Booking.status == "confirmed",
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
            .subquery()
        )
        query = query.filter(Listing.id.notin_(overlapping_listings_subquery))

    # 7. Amenities filter (listing must possess all requested amenity IDs)
    if amenity_ids and len(amenity_ids) > 0:
        for a_id in amenity_ids:
            query = query.filter(
                Listing.amenities.any(Amenity.id == a_id)
            )

    # Count total matching results
    total = query.count()

    # Pagination calculation
    total_pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size
    listings = query.order_by(Listing.id.asc()).offset(offset).limit(page_size).all()

    items = [get_listing_card_dto(l, db) for l in listings]

    return ListingPagination(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


def get_listing_detail(listing_id: int, db: Session) -> ListingDetail:
    """Fetch complete listing detail with host information, amenities, and rating metrics."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} was not found.",
        )

    # Rating metrics
    avg_rating, review_count = _calculate_listing_rating(listing.id, db)

    image_urls = [img.url for img in listing.images] if listing.images else [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ]

    amenities_dto = [
        AmenityRead(id=a.id, name=a.name, icon=a.icon) for a in listing.amenities
    ]

    host_dto = UserBrief(
        id=listing.host.id,
        name=listing.host.name,
        avatar_url=listing.host.avatar_url,
        is_host=listing.host.is_host,
        is_superhost=listing.host.is_superhost,
    )

    return ListingDetail(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        category=listing.category,
        city=listing.city,
        country=listing.country,
        lat=listing.lat,
        lng=listing.lng,
        price_per_night=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        images=image_urls,
        amenities=amenities_dto,
        host=host_dto,
        average_rating=avg_rating,
        review_count=review_count,
    )


def get_blocked_dates(listing_id: int, db: Session) -> List[DateRangeBlocked]:
    """Retrieve all confirmed booking date ranges for a listing to block in calendar pickers."""
    # Verify listing exists
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found.",
        )

    bookings = (
        db.query(Booking)
        .filter(Booking.listing_id == listing_id, Booking.status == "confirmed")
        .order_by(Booking.check_in.asc())
        .all()
    )

    return [
        DateRangeBlocked(
            check_in=b.check_in.isoformat(),
            check_out=b.check_out.isoformat(),
        )
        for b in bookings
    ]
