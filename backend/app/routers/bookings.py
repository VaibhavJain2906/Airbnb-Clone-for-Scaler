from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingRead, BookingCancelResponse
from app.services.booking_service import create_booking, get_user_trips, cancel_booking

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
def book_stay(
    data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Reserve a property stay.
    Validates availability, ensures zero overlap with confirmed bookings, and persists a price snapshot.
    """
    return create_booking(data=data, guest=current_user, db=db)


@router.get("/me", response_model=List[BookingRead])
def my_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all reservations booked by the authenticated user."""
    return get_user_trips(guest=current_user, db=db)


@router.post("/{booking_id}/cancel", response_model=BookingCancelResponse)
def cancel_stay(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel a confirmed booking and free up the dates."""
    return cancel_booking(booking_id=booking_id, current_user=current_user, db=db)
