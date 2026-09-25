from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Date,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    check_in = Column(Date, nullable=False, index=True)
    check_out = Column(Date, nullable=False, index=True)
    guests = Column(Integer, nullable=False, default=1)

    # Immutable Price Snapshot
    nightly_price = Column(Float, nullable=False)
    nights = Column(Integer, nullable=False)
    cleaning_fee = Column(Float, nullable=False, default=0.0)
    service_fee = Column(Float, nullable=False, default=0.0)
    total_price = Column(Float, nullable=False)

    # Status: 'confirmed' or 'cancelled'
    status = Column(String(20), nullable=False, default="confirmed", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_bookings_listing_dates_status", "listing_id", "status", "check_in", "check_out"),
    )

    def __repr__(self):
        return f"<Booking id={self.id} listing_id={self.listing_id} guest_id={self.guest_id} status='{self.status}'>"
