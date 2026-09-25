from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="wishlists")
    listing = relationship("Listing", back_populates="wishlists")

    def __repr__(self):
        return f"<Wishlist user_id={self.user_id} listing_id={self.listing_id}>"
