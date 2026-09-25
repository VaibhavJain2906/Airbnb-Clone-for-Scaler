from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.listing import ListingCard
from app.schemas.wishlist import WishlistToggleResponse
from app.services.wishlist_service import get_user_wishlist, toggle_wishlist, remove_from_wishlist

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=List[ListingCard])
def list_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all saved listings for the current user."""
    return get_user_wishlist(user=current_user, db=db)


@router.post("/{listing_id}", response_model=WishlistToggleResponse)
def toggle_wishlist_item(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle wishlist item for current user."""
    return toggle_wishlist(listing_id=listing_id, user=current_user, db=db)


@router.delete("/{listing_id}", response_model=WishlistToggleResponse)
def remove_wishlist_item(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove item from wishlist."""
    return remove_from_wishlist(listing_id=listing_id, user=current_user, db=db)
