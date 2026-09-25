from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.review import ReviewRead, ReviewCreate
from app.services.review_service import get_listing_reviews, create_review

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/listing/{listing_id}", response_model=List[ReviewRead])
def get_reviews_for_listing(listing_id: int, db: Session = Depends(get_db)):
    """Fetch all reviews for a listing."""
    return get_listing_reviews(listing_id=listing_id, db=db)


@router.post("", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
def submit_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit a verified review for a completed stay."""
    return create_review(data=data, author=current_user, db=db)
