from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_host = Column(Boolean, default=False, nullable=False)
    is_superhost = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="guest")
    reviews = relationship("Review", back_populates="author")
    wishlists = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} name='{self.name}' is_host={self.is_host}>"
