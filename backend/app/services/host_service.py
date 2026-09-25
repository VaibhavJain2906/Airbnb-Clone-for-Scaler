from datetime import date
from typing import List, Dict, Any
from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.listing import Listing, ListingImage, Amenity
from app.models.booking import Booking
from app.models.user import User
from app.schemas.listing import ListingCreate, ListingUpdate, ListingDetail
from app.schemas.booking import BookingRead
from app.services.listing_service import get_listing_card_dto, get_listing_detail


def get_host_dashboard(host: User, db: Session) -> Dict[str, Any]:
    """Retrieve host dashboard metrics, listings, and reservations."""
    listings = (
        db.query(Listing)
        .filter(Listing.host_id == host.id)
        .order_by(Listing.created_at.desc())
        .all()
    )
    listing_ids = [l.id for l in listings]

    total_listings = len(listings)

    # Bookings for this host's properties
    if listing_ids:
        bookings_query = (
            db.query(Booking)
            .filter(Booking.listing_id.in_(listing_ids))
            .order_by(Booking.check_in.desc())
        )
        all_bookings = bookings_query.all()
        confirmed_bookings = [b for b in all_bookings if b.status == "confirmed"]
        upcoming_bookings = [b for b in confirmed_bookings if b.check_out >= date.today()]
        total_revenue = sum(b.total_price for b in confirmed_bookings)
    else:
        all_bookings = []
        upcoming_bookings = []
        total_revenue = 0.0

    # Format listings DTO
    listing_cards = [get_listing_card_dto(l, db) for l in listings]

    # Format bookings DTO
    recent_bookings_dto = []
    for b in all_bookings[:20]:
        cover_image = b.listing.images[0].url if b.listing and b.listing.images else None
        recent_bookings_dto.append(
            BookingRead(
                id=b.id,
                listing_id=b.listing.id if b.listing else 0,
                listing_title=b.listing.title if b.listing else "Listing",
                listing_city=b.listing.city if b.listing else "",
                listing_country=b.listing.country if b.listing else "",
                listing_image=cover_image,
                guest_id=b.guest_id,
                guest_name=b.guest.name if b.guest else "Guest",
                check_in=b.check_in,
                check_out=b.check_out,
                guests=b.guests,
                nightly_price=b.nightly_price,
                nights=b.nights,
                cleaning_fee=b.cleaning_fee,
                service_fee=b.service_fee,
                total_price=b.total_price,
                status=b.status,
                created_at=b.created_at,
            )
        )

    return {
        "stats": {
            "total_listings": total_listings,
            "upcoming_reservations": len(upcoming_bookings),
            "total_reservations": len(all_bookings),
            "total_revenue": round(total_revenue, 2),
        },
        "listings": listing_cards,
        "bookings": recent_bookings_dto,
    }


def create_listing(data: ListingCreate, host: User, db: Session) -> ListingDetail:
    """Create a new listing authored by the authenticated host."""
    listing = Listing(
        host_id=host.id,
        title=data.title,
        description=data.description,
        property_type=data.property_type,
        category=data.category,
        city=data.city,
        country=data.country,
        lat=data.lat or 0.0,
        lng=data.lng or 0.0,
        price_per_night=data.price_per_night,
        cleaning_fee=data.cleaning_fee,
        max_guests=data.max_guests,
        bedrooms=data.bedrooms,
        beds=data.beds,
        bathrooms=data.bathrooms,
    )

    # Attach amenities
    if data.amenity_ids:
        amenities = db.query(Amenity).filter(Amenity.id.in_(data.amenity_ids)).all()
        listing.amenities = amenities

    db.add(listing)
    db.commit()
    db.refresh(listing)

    # Add images
    for pos, url in enumerate(data.image_urls):
        img = ListingImage(listing_id=listing.id, url=url, position=pos)
        db.add(img)

    db.commit()
    db.refresh(listing)

    return get_listing_detail(listing.id, db)


def update_listing(
    listing_id: int,
    data: ListingUpdate,
    host: User,
    db: Session,
) -> ListingDetail:
    """Update an existing listing with strict ownership verification."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found.",
        )

    # Ownership check
    if listing.host_id != host.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify this listing because you do not own it.",
        )

    # Update scalar fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field not in ["image_urls", "amenity_ids"] and hasattr(listing, field):
            setattr(listing, field, value)

    # Update amenities if provided
    if data.amenity_ids is not None:
        amenities = db.query(Amenity).filter(Amenity.id.in_(data.amenity_ids)).all()
        listing.amenities = amenities

    # Update images if provided
    if data.image_urls is not None and len(data.image_urls) > 0:
        db.query(ListingImage).filter(ListingImage.listing_id == listing.id).delete()
        for pos, url in enumerate(data.image_urls):
            db.add(ListingImage(listing_id=listing.id, url=url, position=pos))

    db.commit()
    db.refresh(listing)

    return get_listing_detail(listing.id, db)


def delete_listing(listing_id: int, host: User, db: Session) -> Dict[str, Any]:
    """Delete a listing with strict ownership check and active booking validation."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found.",
        )

    if listing.host_id != host.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this listing.",
        )

    # Check for active upcoming confirmed bookings
    active_booking = (
        db.query(Booking)
        .filter(
            Booking.listing_id == listing.id,
            Booking.status == "confirmed",
            Booking.check_out >= date.today(),
        )
        .first()
    )
    if active_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete listing with active or upcoming confirmed reservations.",
        )

    db.delete(listing)
    db.commit()

    return {"id": listing_id, "message": "Listing successfully deleted."}
