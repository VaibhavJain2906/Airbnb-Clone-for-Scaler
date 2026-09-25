from datetime import date
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.listing import Listing
from app.models.booking import Booking
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingRead, BookingCancelResponse
from app.services.pricing import calculate_price_quote


def create_booking(
    data: BookingCreate,
    guest: User,
    db: Session,
) -> BookingRead:
    """
    Create a new booking with deterministic overlap prevention and price snapshots.
    Validation rules:
    1. Listing must exist.
    2. Check-out date must be strictly after check-in date.
    3. Check-in date cannot be in the past.
    4. Guest count cannot exceed listing max_guests.
    5. No overlapping confirmed bookings (strictly enforced inside a transaction).
    6. Stores immutable financial snapshot.
    """
    # 1. Fetch listing
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {data.listing_id} not found.",
        )

    # 2. Date checks
    if data.check_out <= data.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be strictly after check-in date.",
        )
    if data.check_in < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date cannot be in the past.",
        )

    # 3. Guest count check
    if data.guests > listing.max_guests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This listing accommodates a maximum of {listing.max_guests} guests.",
        )

    # 4. Strict Overlap Check inside database transaction
    # Two bookings overlap when one starts before the other ends and ends after the other starts.
    # Check-out is exclusive, so leaving on this date makes it available to the next guest.
    # Cancelled bookings do not block dates; only confirmed bookings prevent overlap.
    overlapping = (
        db.query(Booking)
        .filter(
            Booking.listing_id == data.listing_id,
            Booking.status == "confirmed",
            Booking.check_in < data.check_out,
            Booking.check_out > data.check_in,
        )
        .first()
    )

    if overlapping:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The selected dates overlap with an existing reservation. Please select different dates.",
        )

    # 5. Calculate pricing snapshot
    # Save the original price snapshot so past bookings remain unchanged when listing rates change.
    quote = calculate_price_quote(
        nightly_price=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        check_in=data.check_in,
        check_out=data.check_out,
    )

    # 6. Create booking record
    booking = Booking(
        listing_id=listing.id,
        guest_id=guest.id,
        check_in=data.check_in,
        check_out=data.check_out,
        guests=data.guests,
        nightly_price=quote.nightly_price,
        nights=quote.nights,
        cleaning_fee=quote.cleaning_fee,
        service_fee=quote.service_fee,
        total_price=quote.total_price,
        status="confirmed",
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    cover_image = listing.images[0].url if listing.images else None

    return BookingRead(
        id=booking.id,
        listing_id=listing.id,
        listing_title=listing.title,
        listing_city=listing.city,
        listing_country=listing.country,
        listing_image=cover_image,
        guest_id=guest.id,
        guest_name=guest.name,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guests=booking.guests,
        nightly_price=booking.nightly_price,
        nights=booking.nights,
        cleaning_fee=booking.cleaning_fee,
        service_fee=booking.service_fee,
        total_price=booking.total_price,
        status=booking.status,
        created_at=booking.created_at,
    )


def get_user_trips(guest: User, db: Session) -> List[BookingRead]:
    """Fetch all bookings made by the current user."""
    bookings = (
        db.query(Booking)
        .filter(Booking.guest_id == guest.id)
        .order_by(Booking.check_in.desc())
        .all()
    )

    result = []
    today = date.today()
    for b in bookings:
        cover_image = b.listing.images[0].url if b.listing and b.listing.images else None
        status_val = b.status
        if status_val == "confirmed" and b.check_out < today:
            status_val = "completed"

        result.append(
            BookingRead(
                id=b.id,
                listing_id=b.listing.id if b.listing else 0,
                listing_title=b.listing.title if b.listing else "Listing",
                listing_city=b.listing.city if b.listing else "",
                listing_country=b.listing.country if b.listing else "",
                listing_image=cover_image,
                guest_id=b.guest_id,
                guest_name=b.guest.name if b.guest else "",
                check_in=b.check_in,
                check_out=b.check_out,
                guests=b.guests,
                nightly_price=b.nightly_price,
                nights=b.nights,
                cleaning_fee=b.cleaning_fee,
                service_fee=b.service_fee,
                total_price=b.total_price,
                status=status_val,
                created_at=b.created_at,
            )
        )
    return result


def cancel_booking(booking_id: int, current_user: User, db: Session) -> BookingCancelResponse:
    """
    Cancel an existing booking.
    Verifies that the user owns the booking or hosts the listing.
    Frees the blocked dates by updating status to 'cancelled' without deleting historical records.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking with id {booking_id} was not found.",
        )

    # Permission check: must be either the guest or the listing's host
    is_guest = booking.guest_id == current_user.id
    is_host = booking.listing and booking.listing.host_id == current_user.id
    if not (is_guest or is_host):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to cancel this reservation.",
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This booking has already been cancelled.",
        )

    booking.status = "cancelled"
    db.commit()

    return BookingCancelResponse(
        id=booking.id,
        status="cancelled",
        message="Reservation successfully cancelled. The dates are now freed for booking.",
    )
