from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_host
from app.models.user import User
from app.schemas.listing import ListingCreate, ListingUpdate, ListingDetail, ListingCard
from app.services.host_service import (
    get_host_dashboard,
    create_listing,
    update_listing,
    delete_listing,
)
from app.services.listing_service import get_listing_card_dto
from app.models.listing import Listing

router = APIRouter(prefix="/host", tags=["Host"])


@router.get("/dashboard", response_model=Dict[str, Any])
def host_dashboard(
    host: User = Depends(require_host),
    db: Session = Depends(get_db),
):
    """Retrieve host dashboard metrics, owned listings, and reservation schedules."""
    return get_host_dashboard(host=host, db=db)


@router.get("/listings", response_model=List[ListingCard])
def list_host_listings(
    host: User = Depends(require_host),
    db: Session = Depends(get_db),
):
    """Retrieve all listings owned by the authenticated host."""
    listings = (
        db.query(Listing)
        .filter(Listing.host_id == host.id)
        .order_by(Listing.created_at.desc())
        .all()
    )
    return [get_listing_card_dto(l, db) for l in listings]


@router.post("/listings", response_model=ListingDetail, status_code=status.HTTP_201_CREATED)
def new_listing(
    data: ListingCreate,
    host: User = Depends(require_host),
    db: Session = Depends(get_db),
):
    """Publish a new listing under the authenticated host's account."""
    return create_listing(data=data, host=host, db=db)


@router.put("/listings/{listing_id}", response_model=ListingDetail)
def edit_listing(
    listing_id: int,
    data: ListingUpdate,
    host: User = Depends(require_host),
    db: Session = Depends(get_db),
):
    """Update listing details, verifying host ownership."""
    return update_listing(listing_id=listing_id, data=data, host=host, db=db)


@router.delete("/listings/{listing_id}", response_model=Dict[str, Any])
def remove_listing(
    listing_id: int,
    host: User = Depends(require_host),
    db: Session = Depends(get_db),
):
    """Delete a listing owned by the authenticated host."""
    return delete_listing(listing_id=listing_id, host=host, db=db)
