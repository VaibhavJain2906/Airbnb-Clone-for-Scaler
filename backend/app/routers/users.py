from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserRead

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserRead])
def list_mock_users(db: Session = Depends(get_db)):
    """List all available mock users for the frontend UserSwitcher component."""
    return db.query(User).order_by(User.id.asc()).all()


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated mock user profile."""
    return current_user


@router.post("/become-host", response_model=UserRead)
def become_host(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upgrade current user to become a host."""
    current_user.is_host = True
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/revert-guest", response_model=UserRead)
def revert_guest(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revert current user back to a guest role."""
    current_user.is_host = False
    db.commit()
    db.refresh(current_user)
    return current_user
