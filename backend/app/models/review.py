from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=True, index=True)
    rating = Column(Integer, nullable=False)  # Overall rating 1 to 5
    cleanliness = Column(Integer, nullable=True, default=5)
    accuracy = Column(Integer, nullable=True, default=5)
    communication = Column(Integer, nullable=True, default=5)
    location = Column(Integer, nullable=True, default=5)
    value = Column(Integer, nullable=True, default=5)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    listing = relationship("Listing", back_populates="reviews")
    author = relationship("User", back_populates="reviews")
    booking = relationship("Booking", back_populates="review")

    def __repr__(self):
        return f"<Review id={self.id} listing_id={self.listing_id} rating={self.rating}>"
