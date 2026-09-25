"""
Deterministic and Idempotent Seed Data Generator for Airbnb Clone.
Seeds:
- 10 Users (6 Hosts, 4 Guests)
- 28 Amenities with icons
- 45 Listings across 12 global cities/countries with 5+ photos each
- Past and future bookings
- Verified reviews linked to completed bookings
- Wishlist items for mock users
"""

import random
from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.listing import Listing, ListingImage, Amenity, listing_amenities
from app.models.booking import Booking
from app.models.review import Review
from app.models.wishlist import Wishlist
from app.services.pricing import calculate_price_quote

CATEGORIES = [
    {"id": "iconic-cities", "name": "Iconic Cities", "icon": "Building2"},
    {"id": "beachfront", "name": "Beachfront", "icon": "Palmtree"},
    {"id": "cabins", "name": "Cabins", "icon": "Home"},
    {"id": "mansions", "name": "Mansions", "icon": "Castle"},
    {"id": "countryside", "name": "Countryside", "icon": "Trees"},
    {"id": "lakefront", "name": "Lakefront", "icon": "Waves"},
    {"id": "amazing-views", "name": "Amazing Views", "icon": "Mountain"},
    {"id": "tiny-homes", "name": "Tiny Homes", "icon": "Box"},
    {"id": "luxe", "name": "Luxe", "icon": "Sparkles"},
    {"id": "skiing", "name": "Skiing", "icon": "Snowflake"},
]

AMENITIES_DATA = [
    {"name": "Fast Wifi", "icon": "Wifi"},
    {"name": "Dedicated workspace", "icon": "Laptop"},
    {"name": "HDTV with Netflix", "icon": "Tv"},
    {"name": "Chef's Kitchen", "icon": "UtensilsCrossed"},
    {"name": "Washer", "icon": "Shirt"},
    {"name": "Dryer", "icon": "Wind"},
    {"name": "Free parking on premises", "icon": "Car"},
    {"name": "Air conditioning", "icon": "AirVent"},
    {"name": "Heating", "icon": "Flame"},
    {"name": "Private outdoor pool", "icon": "Droplets"},
    {"name": "Private hot tub", "icon": "Bath"},
    {"name": "BBQ grill", "icon": "FlameKindling"},
    {"name": "Outdoor dining area", "icon": "SunMedium"},
    {"name": "Patio or balcony", "icon": "Armchair"},
    {"name": "Beach access", "icon": "Footprints"},
    {"name": "Mountain view", "icon": "MountainSnow"},
    {"name": "EV charger", "icon": "Zap"},
    {"name": "Gym", "icon": "Dumbbell"},
    {"name": "Crib", "icon": "Baby"},
    {"name": "High chair", "icon": "Smile"},
    {"name": "Carbon monoxide alarm", "icon": "Bell"},
    {"name": "Smoke alarm", "icon": "ShieldAlert"},
    {"name": "First aid kit", "icon": "Cross"},
    {"name": "Pets allowed", "icon": "PawPrint"},
    {"name": "Self check-in with keypad", "icon": "KeyRound"},
    {"name": "Luggage drop-off allowed", "icon": "Briefcase"},
    {"name": "Indoor fireplace", "icon": "FireExtinguisher"},
    {"name": "Sauna", "icon": "Sparkle"},
]

USERS_DATA = [
    # Hosts
    {
        "id": 1,
        "name": "Elena Rostova",
        "email": "elena.rostova@example.com",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        "is_host": True,
        "is_superhost": True,
    },
    {
        "id": 2,
        "name": "Marcus Vance",
        "email": "marcus.vance@example.com",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        "is_host": True,
        "is_superhost": True,
    },
    {
        "id": 3,
        "name": "Chloe Dupont",
        "email": "chloe.dupont@example.com",
        "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
        "is_host": True,
        "is_superhost": False,
    },
    {
        "id": 4,
        "name": "David Kim",
        "email": "david.kim@example.com",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        "is_host": True,
        "is_superhost": True,
    },
    {
        "id": 5,
        "name": "Sophia Rossi",
        "email": "sophia.rossi@example.com",
        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
        "is_host": True,
        "is_superhost": False,
    },
    {
        "id": 6,
        "name": "Liam Hemsworth",
        "email": "liam.hemsworth@example.com",
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
        "is_host": True,
        "is_superhost": True,
    },
    # Guests
    {
        "id": 7,
        "name": "Sarah Jenkins",
        "email": "sarah.jenkins@example.com",
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
        "is_host": False,
        "is_superhost": False,
    },
    {
        "id": 8,
        "name": "Alex Chen",
        "email": "alex.chen@example.com",
        "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
        "is_host": False,
        "is_superhost": False,
    },
    {
        "id": 9,
        "name": "Maria Garcia",
        "email": "maria.garcia@example.com",
        "avatar_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
        "is_host": False,
        "is_superhost": False,
    },
    {
        "id": 10,
        "name": "James Wilson",
        "email": "james.wilson@example.com",
        "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
        "is_host": False,
        "is_superhost": False,
    },
]

# High-resolution Unsplash photo pools by category
IMAGE_POOLS = {
    "urban": [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ],
    "beach": [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    ],
    "cabin": [
        "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    ],
    "mansion": [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80",
    ],
    "views": [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    ],
}

CITIES_METADATA = [
    {"city": "Tokyo", "country": "Japan", "lat": 35.6762, "lng": 139.6503, "type_bias": "Apartment"},
    {"city": "Paris", "country": "France", "lat": 48.8566, "lng": 2.3522, "type_bias": "Apartment"},
    {"city": "New York", "country": "United States", "lat": 40.7128, "lng": -74.0060, "type_bias": "Loft"},
    {"city": "Rome", "country": "Italy", "lat": 41.9028, "lng": 12.4964, "type_bias": "Condo"},
    {"city": "Cape Town", "country": "South Africa", "lat": -33.9249, "lng": 18.4241, "type_bias": "Villa"},
    {"city": "Bali", "country": "Indonesia", "lat": -8.3405, "lng": 115.0920, "type_bias": "Villa"},
    {"city": "London", "country": "United Kingdom", "lat": 51.5074, "lng": -0.1278, "type_bias": "Townhouse"},
    {"city": "Zurich", "country": "Switzerland", "lat": 47.3769, "lng": 8.5417, "type_bias": "Chalet"},
    {"city": "Sydney", "country": "Australia", "lat": -33.8688, "lng": 151.2093, "type_bias": "Apartment"},
    {"city": "Dubai", "country": "United Arab Emirates", "lat": 25.2048, "lng": 55.2708, "type_bias": "Penthouse"},
    {"city": "Barcelona", "country": "Spain", "lat": 41.3879, "lng": 2.1699, "type_bias": "Apartment"},
    {"city": "Banff", "country": "Canada", "lat": 51.1784, "lng": -115.5708, "type_bias": "Cabin"},
]

DESCRIPTIONS = [
    "Experience world-class luxury in this impeccably designed sanctuary. Features soaring ceilings, floor-to-ceiling panoramic windows, an artisan chef's kitchen, and high-speed fiber internet. Perfectly located within minutes of iconic cultural landmarks, boutique cafes, and fine dining.",
    "A serene retreat tailored for mindful travelers and creative professionals. Enjoy natural architectural elements, sunlit open spaces, a tranquil private courtyard, and designer amenities throughout. Rest in pure comfort with organic linens and ultra-quiet surroundings.",
    "Step into timeless elegance with contemporary comforts. Highlights include a spa-inspired bathroom with rainfall shower, expansive entertaining patio, custom bespoke furniture, and breathtaking morning sunrises. Your unforgettable stay starts here.",
    "Designed by renowned architects, this modern escape combines minimalist Scandinavian aesthetics with warm luxury. Indulge in private outdoor dining, premium sound systems, curated artwork, and effortless check-in.",
]

REVIEW_COMMENTS = [
    "Absolutely breathtaking! The photos don't even do justice to the views. The host was exceptionally responsive and left thoughtful welcome treats. 10/10 recommendation!",
    "One of the cleanest and most well-equipped places I have ever stayed at. The location is peaceful yet close to everything you need. The bed was like sleeping on a cloud.",
    "Flawless check-in experience and incredible attention to detail. Fast wifi made working remotely completely seamless. Will definitely book again next time I'm in town.",
    "Such a stylish, modern space! Super spacious, spotless, and filled with great natural light. Walking distance to superb bakeries and restaurants.",
    "We had an unforgettable weekend here. The host thought of every single amenity, from premium coffee to plush bathrobes. Can't wait to return!",
]


def seed_database(db: Session = None):
    """Idempotently seed the SQLite database if listings count is zero."""
    close_db_at_end = False
    if db is None:
        db = SessionLocal()
        close_db_at_end = True

    try:
        # Check if database is already seeded
        listing_count = db.query(Listing).count()
        if listing_count >= 40:
            print(f"Database already seeded with {listing_count} listings. Skipping seed.")
            return

        print("Seeding database with deterministic sample data...")
        random.seed(42)

        # 1. Create Amenities
        amenity_objs = []
        for a_data in AMENITIES_DATA:
            amenity = db.query(Amenity).filter_by(name=a_data["name"]).first()
            if not amenity:
                amenity = Amenity(name=a_data["name"], icon=a_data["icon"])
                db.add(amenity)
            amenity_objs.append(amenity)
        db.commit()
        for a in amenity_objs:
            db.refresh(a)

        # 2. Create Users
        user_objs = []
        for u_data in USERS_DATA:
            user = db.query(User).filter_by(email=u_data["email"]).first()
            if not user:
                user = User(
                    id=u_data["id"],
                    name=u_data["name"],
                    email=u_data["email"],
                    avatar_url=u_data["avatar_url"],
                    is_host=u_data["is_host"],
                    is_superhost=u_data["is_superhost"],
                    created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(100, 500)),
                )
                db.add(user)
            user_objs.append(user)
        db.commit()
        for u in user_objs:
            db.refresh(u)

        hosts = [u for u in user_objs if u.is_host]
        guests = [u for u in user_objs if not u.is_host]

        # 3. Create 45 Diverse Listings
        titles_prefix = [
            "Architectural Sun-Drenched",
            "Serene Waterfront",
            "Minimalist Glass",
            "Panoramic Sky",
            "Historic Luxury",
            "Tranquil Zen",
            "Modern Boutique",
            "Luxe Designer",
            "Cozy Alpine",
            "Bohemian Chic",
        ]

        created_listings = []
        listing_idx = 1

        for city_info in CITIES_METADATA:
            # 3 to 4 listings per city
            count_for_city = 4 if city_info["city"] in ["Tokyo", "Paris", "New York", "Cape Town", "Bali", "Sydney", "Rome", "Dubai", "Banff"] else 3
            for i in range(count_for_city):
                category = CATEGORIES[(listing_idx - 1) % len(CATEGORIES)]["name"]
                prop_type = city_info["type_bias"]
                if category == "Cabins":
                    prop_type = "Cabin"
                elif category == "Mansions":
                    prop_type = "Villa"
                elif category == "Tiny Homes":
                    prop_type = "Tiny Home"
                elif category == "Luxe":
                    prop_type = "Penthouse"

                prefix = titles_prefix[(listing_idx + i) % len(titles_prefix)]
                title = f"{prefix} {prop_type} in {city_info['city']}"

                # Price and specs
                price = random.choice([85, 120, 165, 210, 275, 340, 420, 580, 750, 920])
                cleaning_fee = random.choice([35, 50, 65, 80, 100])
                bedrooms = random.choice([1, 2, 2, 3, 4])
                beds = bedrooms + random.choice([0, 1, 2])
                bathrooms = float(random.choice([1.0, 1.5, 2.0, 2.5, 3.0]))
                max_guests = beds * 2

                # Host assignment
                assigned_host = hosts[(listing_idx - 1) % len(hosts)]

                listing = Listing(
                    id=listing_idx,
                    host_id=assigned_host.id,
                    title=title,
                    description=random.choice(DESCRIPTIONS),
                    property_type=prop_type,
                    category=category,
                    city=city_info["city"],
                    country=city_info["country"],
                    lat=city_info["lat"] + round(random.uniform(-0.04, 0.04), 4),
                    lng=city_info["lng"] + round(random.uniform(-0.04, 0.04), 4),
                    price_per_night=float(price),
                    cleaning_fee=float(cleaning_fee),
                    max_guests=max_guests,
                    bedrooms=bedrooms,
                    beds=beds,
                    bathrooms=bathrooms,
                    created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(60, 300)),
                )

                # Select 6-12 amenities
                selected_amenities = random.sample(amenity_objs, k=random.randint(7, 14))
                listing.amenities = selected_amenities

                db.add(listing)
                created_listings.append((listing, category))
                listing_idx += 1

        db.commit()

        # 4. Add 5-6 Images per Listing
        for listing, category in created_listings:
            # Pick image category
            if category in ["Beachfront", "Lakefront"]:
                pool = IMAGE_POOLS["beach"]
            elif category in ["Cabins", "Countryside", "Skiing"]:
                pool = IMAGE_POOLS["cabin"]
            elif category in ["Mansions", "Luxe"]:
                pool = IMAGE_POOLS["mansion"]
            elif category == "Amazing Views":
                pool = IMAGE_POOLS["views"]
            else:
                pool = IMAGE_POOLS["urban"]

            # Rotate starting offset so photos vary
            offset = listing.id % len(pool)
            ordered_photos = pool[offset:] + pool[:offset]

            for pos, img_url in enumerate(ordered_photos[:6]):
                db.add(ListingImage(listing_id=listing.id, url=img_url, position=pos))

        db.commit()

        # 5. Add Past Bookings + Verified Reviews
        booking_counter = 1
        for listing, _ in created_listings:
            db.refresh(listing)
            # Create 2 to 4 past completed stays per listing
            num_past = random.randint(2, 4)
            for p in range(num_past):
                guest = guests[p % len(guests)]
                days_ago = 30 + (p * 45) + random.randint(1, 15)
                check_in = date.today() - timedelta(days=days_ago)
                nights = random.randint(3, 7)
                check_out = check_in + timedelta(days=nights)

                quote = calculate_price_quote(
                    nightly_price=listing.price_per_night,
                    cleaning_fee=listing.cleaning_fee,
                    check_in=check_in,
                    check_out=check_out,
                )

                past_booking = Booking(
                    id=booking_counter,
                    listing_id=listing.id,
                    guest_id=guest.id,
                    check_in=check_in,
                    check_out=check_out,
                    guests=random.randint(1, min(listing.max_guests, 4)),
                    nightly_price=quote.nightly_price,
                    nights=quote.nights,
                    cleaning_fee=quote.cleaning_fee,
                    service_fee=quote.service_fee,
                    total_price=quote.total_price,
                    status="confirmed",
                    created_at=datetime.now(timezone.utc) - timedelta(days=days_ago + 10),
                )
                db.add(past_booking)
                db.commit()
                db.refresh(past_booking)

                # Attach verified review to this booking
                rating = random.choices([5, 4], weights=[0.85, 0.15])[0]
                review = Review(
                    listing_id=listing.id,
                    author_id=guest.id,
                    booking_id=past_booking.id,
                    rating=rating,
                    comment=random.choice(REVIEW_COMMENTS),
                    created_at=datetime.now(timezone.utc) - timedelta(days=days_ago - 5),
                )
                db.add(review)
                booking_counter += 1

            # 6. Future Bookings (so calendar blocking can be tested immediately!)
            # For the first 6 listings, add upcoming bookings
            if listing.id in [1, 2, 4, 7]:
                future_in = date.today() + timedelta(days=7 + (listing.id * 3))
                future_out = future_in + timedelta(days=4)
                f_quote = calculate_price_quote(
                    nightly_price=listing.price_per_night,
                    cleaning_fee=listing.cleaning_fee,
                    check_in=future_in,
                    check_out=future_out,
                )
                future_booking = Booking(
                    id=booking_counter,
                    listing_id=listing.id,
                    guest_id=guests[0].id,  # Sarah Jenkins
                    check_in=future_in,
                    check_out=future_out,
                    guests=2,
                    nightly_price=f_quote.nightly_price,
                    nights=f_quote.nights,
                    cleaning_fee=f_quote.cleaning_fee,
                    service_fee=f_quote.service_fee,
                    total_price=f_quote.total_price,
                    status="confirmed",
                    created_at=datetime.now(timezone.utc) - timedelta(days=2),
                )
                db.add(future_booking)
                booking_counter += 1

        db.commit()

        # 7. Wishlist Items for Default Guest (Sarah Jenkins, id=7)
        for saved_id in [1, 3, 5, 8, 12]:
            db.add(Wishlist(user_id=7, listing_id=saved_id))
        db.commit()

        print(f"Successfully seeded {len(created_listings)} listings, {len(amenity_objs)} amenities, {len(user_objs)} users, bookings, reviews, and wishlists.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if close_db_at_end:
            db.close()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_database()
