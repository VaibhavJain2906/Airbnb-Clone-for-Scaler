from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.listing import Listing
from app.models.wishlist import Wishlist
from app.models.user import User
from app.schemas.listing import ListingCard
from app.schemas.wishlist import WishlistToggleResponse
from app.services.listing_service import get_listing_card_dto


def toggle_wishlist(listing_id: int, user: User, db: Session) -> WishlistToggleResponse:
    """Toggle a listing in the user's wishlist."""
    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id, Wishlist.listing_id == listing_id)
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        return WishlistToggleResponse(
            listing_id=listing_id,
            is_saved=False,
            message="Removed from wishlist.",
        )
    else:
        # Check listing exists
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listing with id {listing_id} not found.",
            )

        new_item = Wishlist(user_id=user.id, listing_id=listing_id)
        db.add(new_item)
        db.commit()
        return WishlistToggleResponse(
            listing_id=listing_id,
            is_saved=True,
            message="Added to wishlist.",
        )


def remove_from_wishlist(listing_id: int, user: User, db: Session) -> WishlistToggleResponse:
    """Explicitly remove an item from wishlist (idempotent)."""
    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id, Wishlist.listing_id == listing_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
    return WishlistToggleResponse(
        listing_id=listing_id,
        is_saved=False,
        message="Removed from wishlist.",
    )


def get_user_wishlist(user: User, db: Session) -> List[ListingCard]:
    """Retrieve all listings saved in the current user's wishlist."""
    items = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id)
        .order_by(Wishlist.created_at.desc())
        .all()
    )
    return [get_listing_card_dto(item.listing, db) for item in items if item.listing]
