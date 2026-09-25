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
            cleanliness=getattr(r, "cleanliness", 5) or 5,
            accuracy=getattr(r, "accuracy", 5) or 5,
            communication=getattr(r, "communication", 5) or 5,
            location=getattr(r, "location", 5) or 5,
            value=getattr(r, "value", 5) or 5,
            comment=r.comment,
            created_at=r.created_at,
        )
        for r in reviews
    ]


def create_review(data: ReviewCreate, author: User, db: Session) -> ReviewRead:
    """
    Create a verified review for a stay.
    Allows passing listing_id directly (with optional booking_id).
    Validates listing existence and saves overall + category ratings.
    """
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {data.listing_id} was not found.",
        )

    booking_id_val = None
    if data.booking_id:
        booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking with id {data.booking_id} was not found.",
            )
        if booking.guest_id != author.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only review reservations you booked as a guest.",
            )
        # Check if already reviewed with this booking_id
        existing = db.query(Review).filter(Review.booking_id == data.booking_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A review has already been submitted for this stay.",
            )
        booking_id_val = booking.id
    else:
        # Check if guest has a completed booking for this listing without a review
        candidate = (
            db.query(Booking)
            .filter(
                Booking.listing_id == data.listing_id,
                Booking.guest_id == author.id,
            )
            .first()
        )
        if candidate:
            existing_rev = db.query(Review).filter(Review.booking_id == candidate.id).first()
            if not existing_rev:
                booking_id_val = candidate.id

    review = Review(
        listing_id=data.listing_id,
        author_id=author.id,
        booking_id=booking_id_val,
        rating=data.rating,
        cleanliness=data.cleanliness or data.rating,
        accuracy=data.accuracy or data.rating,
        communication=data.communication or data.rating,
        location=data.location or data.rating,
        value=data.value or data.rating,
        comment=data.comment.strip(),
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
        cleanliness=review.cleanliness or review.rating,
        accuracy=review.accuracy or review.rating,
        communication=review.communication or review.rating,
        location=review.location or review.rating,
        value=review.value or review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )
