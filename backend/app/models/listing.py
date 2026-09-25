from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
    Table,
    Index,
)
from sqlalchemy.orm import relationship
from app.core.database import Base

# Association table for Listing <-> Amenity many-to-many relationship
listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    icon = Column(String(50), nullable=False)  # Lucide icon identifier (e.g., 'wifi', 'tv', 'pool')

    # Many-to-many with Listing
    listings = relationship(
        "Listing",
        secondary=listing_amenities,
        back_populates="amenities",
    )

    def __repr__(self):
        return f"<Amenity id={self.id} name='{self.name}'>"


class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(500), nullable=False)
    position = Column(Integer, default=0, nullable=False)  # 0 is the primary cover image

    listing = relationship("Listing", back_populates="images")

    __table_args__ = (
        Index("ix_listing_images_listing_id_position", "listing_id", "position"),
    )

    def __repr__(self):
        return f"<ListingImage id={self.id} listing_id={self.listing_id} pos={self.position}>"


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    property_type = Column(String(50), nullable=False, index=True)  # Apartment, Villa, Cabin, House, etc.
    category = Column(String(50), nullable=False, index=True)       # Beachfront, Cabins, Iconic Cities, etc.
    city = Column(String(100), nullable=False, index=True)
    country = Column(String(100), nullable=False, index=True)
    lat = Column(Float, nullable=False, default=0.0)
    lng = Column(Float, nullable=False, default=0.0)
    price_per_night = Column(Float, nullable=False, index=True)
    cleaning_fee = Column(Float, nullable=False, default=0.0)
    max_guests = Column(Integer, nullable=False, default=1, index=True)
    bedrooms = Column(Integer, nullable=False, default=1)
    beds = Column(Integer, nullable=False, default=1)
    bathrooms = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    host = relationship("User", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.position")
    amenities = relationship("Amenity", secondary=listing_amenities, back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    wishlists = relationship("Wishlist", back_populates="listing", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Listing id={self.id} title='{self.title[:20]}' city='{self.city}' price={self.price_per_night}>"
