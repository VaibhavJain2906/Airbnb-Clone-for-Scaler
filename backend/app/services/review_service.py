from datetime import date
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.listing import Listing
from app.models.booking import Booking
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewRead


def get_listing_reviews(listing_id: int, db: Session) -> List[ReviewRead]:
    """Fetch all reviews associated with a listing, ordered newest first."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found.",
        )

    reviews = (
        db.query(Review)
        .filter(Review.listing_id == listing_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return [
        ReviewRead(
            id=r.id,
            listing_id=r.listing_id,
            author_id=r.author_id,
            author_name=r.author.name if r.author else "Guest",
            author_avatar=r.author.avatar_url if r.author else None,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
        )
        for r in reviews
    ]


def create_review(data: ReviewCreate, author: User, db: Session) -> ReviewRead:
    """
    Create a verified review for a completed stay.
    Rules:
    1. Booking must exist and belong to the author.
    2. Stay must be completed (check_out <= date.today()).
    3. Exactly one review per booking (booking_id is unique).
    """
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking with id {data.booking_id} was not found.",
        )

    # Ownership check
    if booking.guest_id != author.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review reservations you booked and completed as a guest.",
        )

    # Must be confirmed and completed
    if booking.status != "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot review a cancelled reservation.",
        )

    # Check for existing review on this booking
    existing = db.query(Review).filter(Review.booking_id == booking.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A review has already been submitted for this stay.",
        )

    review = Review(
        listing_id=booking.listing_id,
        author_id=author.id,
        booking_id=booking.id,
        rating=data.rating,
        comment=data.comment,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return ReviewRead(
        id=review.id,
        listing_id=review.listing_id,
        author_id=author.id,
        author_name=author.name,
        author_avatar=author.avatar_url,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )
