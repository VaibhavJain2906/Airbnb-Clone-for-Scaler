from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User


def get_current_user(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> User:
    """
    Mock authentication dependency.
    Extracts user ID from the 'X-User-Id' HTTP header.
    Defaults to Sarah Jenkins (id=7, standard guest user) if header is omitted or invalid.
    """
    user_id = 7  # default fallback mock user
    if x_user_id:
        try:
            user_id = int(x_user_id)
        except ValueError:
            user_id = 7

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Fallback to the first user in the database
        user = db.query(User).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No users found in database. Please seed the database.",
            )
    return user


def require_host(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Authorization guard: guarantees the current user is flagged as a host.
    """
    if not current_user.is_host:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Host privileges required for this action. Please switch to a host account or become a host.",
        )
    return current_user
