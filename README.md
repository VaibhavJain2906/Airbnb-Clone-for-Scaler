# Airbnb Fullstack Clone — SDE Assessment

A production-style, modular, and explainable Airbnb marketplace clone built from scratch with **Next.js (TypeScript)**, **FastAPI (Python)**, **SQLAlchemy 2.0**, and **SQLite**.

---

## 🌟 Key Features

### 👤 Guest Experience
- **Home & Explore**: High-density listing cards with photo carousels, destination, star rating, price per night, and category pills.
- **Search & Filter (URL-State Driven)**: Filter by destination, dates, guests count, price range ($0–$1,000+), property types, and 28+ amenities. Search state is synced directly to URL search params for shareability and history navigation.
- **Listing Details**: 5-photo showcase gallery with full-screen photo modal, host card with Superhost badges, amenities with icons, location map, and verified guest reviews.
- **Interactive Booking Widget**:
  - Live calendar availability reflecting server-blocked dates.
  - Dynamic guest counter bounded by listing capacity.
  - Real-time transparent price quotation (nights × rate + cleaning fee + 14% service fee).
- **Checkout & Confirmation**: Trip review, mocked payment form with card validation, instant backend availability re-validation inside a transaction, and confirmed receipt generation.
- **My Trips**: Categorized upcoming and past stays with stay metrics and interactive reservation cancellation (which releases blocked dates).
- **Wishlists / Favorites**: Optimistic bookmarking synced with backend storage.

### 🏡 Host Experience
- **Host Dashboard**: High-level hosting KPIs (Total listings, active reservations, total revenue) with tabs for property management and incoming guest schedules.
- **Listing Lifecycle (CRUD)**:
  - Create new listings with photo URLs, coordinates, pricing, and amenities.
  - Edit existing listings with strict ownership checks.
  - Delete listings with active booking guards.
- **Role Switcher**: Mock authentication switcher in the navigation bar allows instant toggling between Superhosts, Hosts, and Guests without password friction.

---

## 🛠️ Technology Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js (App Router)** | Server & client components, routing, SEO |
| **Language** | **TypeScript** | Strict compile-time type safety |
| **Styling** | **Tailwind CSS** | Airbnb design tokens, custom animations, clean layout |
| **Icons** | **Lucide React** | Feather-style icons matching Airbnb UI |
| **Backend Framework** | **FastAPI** | High-performance asynchronous REST API, OpenAPI docs |
| **Data Validation** | **Pydantic v2** | Request/response DTO schemas |
| **Database & ORM** | **SQLite + SQLAlchemy 2.0** | Relational schema, transactions, foreign keys |
| **HTTP Client** | **Fetch API / Central Client** | Single `api.ts` module with `X-User-Id` injection |

---

## 🏛️ System Architecture

The codebase enforces strict separation of concerns to maximize explainability during technical evaluation:

### Backend Architecture
```
FastAPI Router (app/routers/*.py)
   │  - Validates request payload via Pydantic
   │  - Extracts caller identity (X-User-Id)
   │  - Delegates directly to Service
   ▼
Service Layer (app/services/*.py)
   │  - Contains ALL business logic
   │  - Overlap check algorithms, pricing formulas, ownership assertions
   │  - Controls transactions (db.commit / db.rollback)
   ▼
Database / Models (app/models/*.py)
   │  - SQLAlchemy Declarative Base entities
   │  - SQLite with PRAGMA foreign_keys = ON
   ▼
SQLite (airbnb.db)
```

### Frontend Architecture
```
App Router Pages (src/app/**/page.tsx)
   │  - Page-level data fetching and URL synchronization
   ▼
Domain & UI Components (src/components/**/*.tsx)
   │  - Modular, reusable UI building blocks
   ▼
Context & Custom Hooks (src/context/*, src/hooks/*)
   │  - UserContext (active mock user), useWishlist, useSearchFilters
   ▼
Centralized API Client (src/lib/api.ts)
   │  - Single entry point for all HTTP requests
   │  - Automatically injects 'X-User-Id' header
   ▼
FastAPI REST API (http://localhost:8000/api)
```

---

## 🗄️ Database Design & Entity Relationships

The schema consists of 8 normalized relational tables:

```
users (id, name, email, avatar_url, is_host, is_superhost, created_at)
  │
  ├── listings (id, host_id -> users.id, title, city, country, price_per_night, cleaning_fee, max_guests...)
  │     ├── listing_images (id, listing_id -> listings.id, url, position)
  │     ├── listing_amenities (listing_id, amenity_id -> amenities.id) [Composite PK]
  │     ├── bookings (id, listing_id, guest_id -> users.id, check_in, check_out, total_price, status...)
  │     │     └── reviews (id, listing_id, author_id, booking_id [UNIQUE], rating, comment)
  │     └── wishlists (user_id -> users.id, listing_id -> listings.id) [Composite PK]
  └── amenities (id, name, icon)
```

### Key Schema Decisions
1. **Unified `users` Table with `is_host` Flag**: On Airbnb, one account can both travel and host. Hosting is an account role, not a distinct entity type.
2. **Immutable Price Snapshots on `bookings`**: Stores `nightly_price`, `nights`, `cleaning_fee`, `service_fee`, and `total_price` at the moment of reservation. If a host later alters the nightly rate, historical receipts and financial reports remain unchanged.
3. **Exclusive Check-Out (`[check_in, check_out)`)**: Check-out dates are exclusive, supporting standard hotel/Airbnb same-day turnovers (Guest A checks out on Oct 5; Guest B checks in on Oct 5).
4. **Cancelled Status Preservation**: Instead of deleting rows, cancellations set `status = "cancelled"`. This frees up the dates for new reservations while retaining historical audit records for trips and dashboards.
5. **Verified Stay Reviews (`booking_id UNIQUE`)**: Reviews require a completed booking and can only be submitted once per stay by the guest who completed the trip.
6. **Composite Primary Keys**: `wishlists` uses `(user_id, listing_id)` composite PK to enforce single-bookmark constraints directly at the database engine level.
7. **Performance Indexes**:
   - `ix_bookings_listing_dates_status` on `(listing_id, status, check_in, check_out)` for sub-millisecond overlap queries.
   - `ix_listings_city`, `ix_listings_category`, and `ix_listings_price` for fast search filtering.

---

## 🔒 Booking Correctness & Overlap Logic

Double bookings are strictly prevented on the backend inside an ACID database transaction.

### Overlap Condition Math
Given a requested booking `[req_in, req_out)` and an existing confirmed booking `[exist_in, exist_out)`:

$$\text{Overlap occurs if and only if: } \text{exist\_in} < \text{req\_out} \quad \text{AND} \quad \text{exist\_out} > \text{req\_in}$$

```python
# Implemented in app/services/booking_service.py
overlapping = db.query(Booking).filter(
    Booking.listing_id == data.listing_id,
    Booking.status == "confirmed",
    Booking.check_in < data.check_out,
    Booking.check_out > data.check_in,
).first()

if overlapping:
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="The selected dates overlap with an existing reservation."
    )
```

---

## 💰 Centralized Pricing Engine

All pricing calculations are centralized in `app/services/pricing.py`:

```
nights = (check_out - check_in).days
base_price = round(nightly_price * nights, 2)
service_fee = round(base_price * 0.14, 2)    # Configurable 14% service fee
total_price = round(base_price + cleaning_fee + service_fee, 2)
```

This single function powers both:
1. `GET /api/listings/{id}/quote`: Preview quote displayed in the booking widget.
2. `POST /api/bookings`: Immutable snapshot saved to the database upon reservation.

---

## 🔐 Mock Authentication System

Real authentication is mocked via an `X-User-Id` HTTP header to facilitate seamless evaluation:
- The frontend `UserSwitcher` dropdown stores the selected user ID in `localStorage`.
- `src/lib/api.ts` automatically attaches `X-User-Id: <id>` to every outgoing request.
- The FastAPI dependency `get_current_user` resolves the user entity from the header.
- The `require_host` dependency verifies `user.is_host == True`, raising `403 Forbidden` if a guest attempts host operations.
- Host CRUD operations assert `listing.host_id == current_user.id`, preventing hosts from tampering with listings they do not own.

### Seeded Mock Users

| ID | Name | Role | Profile Summary |
| :--- | :--- | :--- | :--- |
| **1** | **Elena Rostova** | Host (Superhost) | Owns 8 listings across Cape Town and London |
| **2** | **Marcus Vance** | Host (Superhost) | Owns luxury lofts in Tokyo & Kyoto |
| **3** | **Chloe Dupont** | Host | Apartments in Paris & French Riviera |
| **4** | **David Kim** | Host (Superhost) | Penthouses in New York & Aspen |
| **5** | **Sophia Rossi** | Host | Villas in Rome & Amalfi |
| **6** | **Liam Hemsworth** | Host (Superhost) | Beachfront stays in Sydney & Bali |
| **7** | **Sarah Jenkins** | Guest (Default) | Active traveler with booked trips & wishlists |
| **8** | **Alex Chen** | Guest | Regular guest account |
| **9** | **Maria Garcia** | Guest | Regular guest account |
| **10** | **James Wilson** | Guest | Regular guest account |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the test suite (17 automated tests verifying search, overlaps, and CRUD)
python test_api.py

# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will automatically create `airbnb.db` and populate it with 45 listings across 12 cities on first startup.
- API Documentation (Swagger): [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Coverage

The automated test suite (`backend/test_api.py`) runs 17 comprehensive integration tests:
1. `GET /api/health` -> System health and CORS verification.
2. `GET /api/meta/categories` & `/amenities` -> Metadata catalogs.
3. `GET /api/users` -> Mock switcher user identities.
4. `GET /api/listings?location=Tokyo` -> Case-insensitive location search.
5. `GET /api/listings?min_price=100&max_price=300&guests=2` -> Capacity & price range filtering.
6. `GET /api/listings/{id}` -> Full detail retrieval with ratings.
7. `GET /api/listings/{id}/quote` -> Accurate night calculation and 14% fee application.
8. `POST /api/bookings` -> Successful reservation creation with price snapshot.
9. `POST /api/bookings` (Overlap) -> Overlap validation returns `409 Conflict` on both identical and partial overlaps.
10. `GET /api/listings/{id}/availability` -> Blocked calendar dates reflect active reservations.
11. `GET /api/bookings/me` -> User trips retrieval.
12. `POST /api/bookings/{id}/cancel` -> Reservation cancellation.
13. `POST /api/bookings` (Re-book) -> Cancelled dates immediately become bookable again.
14. `POST/DELETE /api/wishlist/{id}` -> Wishlist toggle, deduplication, and removal.
15. `GET /api/host/dashboard` -> Host KPI metrics and revenue calculations.
16. Non-host role security -> `403 Forbidden` for unauthorized host operations.
17. Foreign listing ownership guard -> `403 Forbidden` if Host A attempts to update Host B's listing.

Run the test suite anytime:
```bash
cd backend
python test_api.py
```

---

## 🎯 Interview Explanation Cheat Sheet

### Q1: Why did you choose the `Routers → Services → Models` architecture?
**Answer**: Route handlers should strictly manage HTTP-specific concerns: reading headers, parsing query parameters, validating schemas, and returning status codes. Business logic (such as date overlap algorithms, pricing formulas, and authorization checks) belongs in the Service layer. This keeps business rules testable without spinning up HTTP servers and ensures reusable logic across different API endpoints.

### Q2: How does your overlap detection prevent double bookings?
**Answer**: A requested booking `[req_in, req_out)` overlaps an existing confirmed booking `[exist_in, exist_out)` if and only if:
`exist_in < req_out AND exist_out > req_in`.
This check executes inside an isolated database transaction (`db.begin()`) right before inserting the new booking. If any overlapping row with `status == 'confirmed'` is found, the transaction is rolled back and an `HTTP 409 Conflict` is returned.

### Q3: Why store a price snapshot on the booking table?
**Answer**: In real-world marketplaces, hosts frequently update nightly rates and cleaning fees. If bookings only referenced the listing's current price, historical receipts and revenue totals would retroactively change whenever a host updated their listing. Storing an immutable snapshot at checkout guarantees financial consistency and auditable receipts.

### Q4: How is mock authentication implemented?
**Answer**: We use an `X-User-Id` header injected by a centralized API client (`src/lib/api.ts`). A FastAPI dependency (`get_current_user`) extracts this header and resolves the user entity from SQLite. Host authorization is enforced by `require_host`, and listing mutations verify `listing.host_id == current_user.id`.

### Q5: Why is search state stored in the URL query string?
**Answer**: Storing filter criteria in URL parameters (`?location=Tokyo&guests=2...`) ensures shareable links, browser back/forward button support, and persistence across page refreshes without relying on ephemeral client memory.

---

## 📄 License
This project was developed for the SDE Fullstack Assessment. Plagiarism from external repositories was strictly avoided. All code and schemas were authored from scratch.
