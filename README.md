# Airbnb Clone

A full-stack Airbnb-style property marketplace built for the SDE Fullstack assessment. The application allows guests to explore accommodations worldwide, filter by category and amenities, inspect availability on an interactive calendar, review detailed price breakdowns, reserve stays, write verified reviews, and manage upcoming or past trips.

Hosts can access a dedicated dashboard with real-time portfolio metrics, publish new listings with multi-photo galleries, update listing configurations, and manage reservations. The system includes an interactive Leaflet map, wishlist synchronization, and a mock authentication system for switching between guest and host personas.

---

## Features

### Guest Features
* **Explore Listings**: Browse property cards with image carousels, pricing, locations, and guest ratings.
* **Category Navigation**: Filter by 10 distinct lifestyle categories including Iconic Cities, Beachfront, Cabins, Mansions, Countryside, Lakefront, Amazing Views, Tiny Homes, Luxe, and Skiing.
* **Search and Filtering**: Search by location, stay dates, guest counts, price range, property type, and 24 specific amenities.
* **Property Detail Page**: Inspect high-resolution photo galleries, host credentials, bedroom/bed/bath specifications, full amenity checklists, and location coordinates.
* **Interactive Map**: View real geographic coordinates with custom map markers powered by Leaflet and OpenStreetMap.
* **Real-time Price Breakdown**: Automatic calculation of nightly rate, duration, cleaning fee, and 14% service fee.
* **Interactive Booking Calendar**: Select check-in and check-out dates with blocked dates dynamically disabled.
* **Reservation Checkout**: Confirm bookings with instant availability validation and immutable price snapshots.
* **Trip Management**: View confirmed, completed, and cancelled reservations with the ability to cancel upcoming stays.
* **Verified Reviews**: Submit 5-star ratings and written reviews for completed stays.
* **Wishlist**: Save and unsave favorite properties with instant database persistence.

### Host Features
* **Host Dashboard**: View property portfolio metrics including total properties, active reservations, and total earnings.
* **Create Listings**: Publish accommodations with title, description, location, nightly price, cleaning fee, guest limits, bed/bath specs, amenities, and image URLs.
* **Edit Listings**: Update pricing, capacity, descriptions, and listing details.
* **Delete Listings**: Remove properties with cascading deletion of associated images and records.
* **Reservation Overview**: Inspect scheduled reservations across all hosted properties.

### Additional Features
* **Mock User Switcher**: Switch instantly between pre-configured guest and host accounts via the header UI.
* **Dynamic Role Toggle**: Upgrade any guest account to a host account via an in-app button.
* **Toast Notifications**: Feedback for bookings, cancellations, wishlist actions, and listing management.
* **Responsive Layout**: Designed for mobile, tablet, and desktop viewports.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | Next.js 16 (App Router) | React Server & Client Components, routing, SSR |
| UI & Language | React 19, TypeScript | Strict component typing and state management |
| Styling | Tailwind CSS v4 | Utility-first responsive design |
| Icons | Lucide React | UI and amenity icon set |
| Maps | Leaflet | Client-rendered interactive property maps |
| Backend Framework | FastAPI | High-performance Python async REST API |
| Server | Uvicorn | ASGI web server |
| Database | SQLite | Relational database storage |
| ORM | SQLAlchemy 2.0 | Schema definition, queries, and transactions |
| Validation | Pydantic v2 | Request/response data validation and serialization |
| HTTP Client | Fetch API (Frontend) / HTTPX (Tests) | Network requests and integration test suite |

---

## Project Structure

```text
Airbnb-Clone/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── book/[id]/        # Checkout and booking confirmation page
│   │   │   ├── host/             # Host dashboard and listing management
│   │   │   ├── rooms/[id]/       # Property detail page
│   │   │   ├── trips/            # Guest trip management (Upcoming, Past, Cancelled)
│   │   │   ├── wishlists/        # Saved listings page
│   │   │   ├── layout.tsx        # Root layout with AuthProvider and Navigation
│   │   │   └── page.tsx          # Homepage with search, categories, and grid
│   │   ├── components/
│   │   │   ├── booking/          # Booking widget, date picker, price breakdown
│   │   │   ├── common/           # Navbar, footer, modal dialogs, empty states
│   │   │   ├── host/             # Listing creation and editing forms
│   │   │   ├── listing-detail/   # Image gallery, amenities, Leaflet map, reviews
│   │   │   └── listings/         # Listing cards, search bar, category filters
│   │   ├── context/              # AuthContext with mock user switcher state
│   │   ├── hooks/                # Custom React hooks (listings, debounce)
│   │   └── lib/                  # Centralized API client, formatters, and TypeScript types
│   ├── package.json
│   └── next.config.ts
│
├── backend/
│   ├── app/
│   │   ├── core/                 # App configuration, database connection, auth dependencies
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── routers/              # API route definitions
│   │   ├── schemas/              # Pydantic request and response schemas
│   │   ├── seed/                 # Deterministic seed data generator
│   │   ├── services/             # Core business logic (pricing, booking overlap, listings)
│   │   └── main.py               # FastAPI entry point, lifespan, CORS configuration
│   ├── test_api.py               # Automated integration test suite
│   ├── requirements.txt
│   └── airbnb.db                 # SQLite database file
│
└── README.md
```

---

## Architecture

The project follows a decoupled client-server architecture with separation of concerns:

```text
[ Browser / Next.js Client ]
             │
      HTTP / REST API (X-User-Id header for mock auth)
             ▼
[ FastAPI Routers (app/routers) ]
             │
             ▼
[ Service Layer (app/services) ]
   ├── Availability & Overlap Checks
   ├── Pricing Engine
   └── Host & Listing Management
             │
             ▼
[ SQLAlchemy 2.0 ORM (app/models) ]
             │
             ▼
[ SQLite Database (airbnb.db) ]
```

* **Routers (`backend/app/routers`)**: Handle HTTP request parsing, query parameter sanitization, route security dependencies, and HTTP response status codes.
* **Service Layer (`backend/app/services`)**: Contains pure business logic. This includes calculating booking quotes, validating date availability with overlap prevention inside transactions, and checking host permissions.
* **Models (`backend/app/models`)**: Define the database schema, relational constraints, foreign keys, and cascading rules using SQLAlchemy declarative mapping.
* **Frontend Architecture**: Built with Next.js App Router. State for the active user is held in `AuthContext` and persisted in local storage. All external HTTP requests pass through a centralized API client (`frontend/src/lib/api.ts`) that automatically attaches the `X-User-Id` header to every outgoing request.

---

## Database Schema

The database consists of 8 relational tables:

| Table | Purpose |
|---|---|
| `users` | Stores guest and host accounts, profile information, and role flags |
| `listings` | Core property records including pricing, location, specs, and host foreign key |
| `listing_images` | Ordered image URLs for each listing (position 0 is the primary cover) |
| `amenities` | Standardized amenities catalog with Lucide icon references |
| `listing_amenities` | Many-to-many join table connecting listings and amenities |
| `bookings` | Guest reservations with confirmed dates and immutable price snapshots |
| `reviews` | Verified guest reviews with ratings and category sub-ratings |
| `wishlists` | Saved listings per user enforcing unique pairs via a composite primary key |

### Schema Relationships and Integrity

```text
users ──< listings ──< listing_images
  │          │
  │          ├──< listing_amenities >── amenities
  │          │
  ├──< bookings >── reviews
  │          │
  └──< wishlists >── listings
```

* **Price Snapshot**: The `bookings` table stores `nightly_price`, `nights`, `cleaning_fee`, `service_fee`, and `total_price` as calculated at the moment of booking. If a host later alters the nightly rate of a listing, existing reservations remain historically accurate.
* **Composite Keys**: The `wishlists` table uses `(user_id, listing_id)` as a composite primary key, preventing duplicate saves at the database engine level.
* **Indexes**: Indexed columns include `listings.city`, `listings.price_per_night`, `listings.property_type`, `listings.category`, and a composite index on `bookings(listing_id, status, check_in, check_out)` for fast conflict detection.
* **Cascading Deletions**: Deleting a listing cascades to remove related images, booking records, reviews, and wishlist associations.

---

## API Overview

All API endpoints are prefixed with `/api`. Interactive documentation is available via Swagger UI at `/api/docs`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/listings` | Search listings with filters (location, dates, guests, price, amenities) |
| `GET` | `/api/listings/{id}` | Retrieve complete listing details including host, images, and amenities |
| `GET` | `/api/listings/{id}/availability` | List confirmed booking date ranges for calendar blocking |
| `GET` | `/api/listings/{id}/quote` | Calculate real-time pricing breakdown for requested dates |
| `POST` | `/api/bookings` | Reserve a stay (validates availability and creates price snapshot) |
| `GET` | `/api/bookings/me` | Fetch all trips for the authenticated mock user |
| `POST` | `/api/bookings/{id}/cancel` | Cancel an upcoming reservation and release the blocked dates |
| `GET` | `/api/host/dashboard` | Retrieve host summary statistics, listings, and reservations |
| `GET` | `/api/host/listings` | Fetch all listings owned by the authenticated host |
| `POST` | `/api/host/listings` | Create a new property listing (host privileges required) |
| `PUT` | `/api/host/listings/{id}` | Update listing details (verifies host ownership) |
| `DELETE` | `/api/host/listings/{id}` | Delete a listing (verifies host ownership) |
| `GET` | `/api/wishlist` | Retrieve saved listings for the authenticated user |
| `POST` | `/api/wishlist/{id}` | Toggle listing in/out of the user's wishlist |
| `DELETE` | `/api/wishlist/{id}` | Remove listing from wishlist |
| `GET` | `/api/reviews/listing/{id}` | Fetch all reviews for a listing |
| `POST` | `/api/reviews` | Submit a review for a completed stay |
| `GET` | `/api/users` | List all mock users for the frontend user switcher |
| `GET` | `/api/users/me` | Get profile of the currently active mock user |
| `POST` | `/api/users/become-host` | Upgrade current user account to host status |
| `POST` | `/api/users/revert-guest` | Revert current user account back to guest status |
| `GET` | `/api/meta/categories` | Retrieve available listing categories with icons |
| `GET` | `/api/meta/amenities` | Retrieve full list of amenities with icons |
| `GET` | `/api/health` | Health check endpoint returning service status |

### API Behavior and Error Handling
* **Validation**: Input payloads are validated by Pydantic schemas. Invalid inputs return `400 Bad Request` or `422 Unprocessable Entity` with field-level details.
* **Booking Conflict**: If requested dates overlap with an existing confirmed reservation, the API returns `409 Conflict`.
* **Authorization**: Endpoints requiring host privileges (`/api/host/*`) return `403 Forbidden` if the user is not flagged as a host.
* **Resource Not Found**: Requests for non-existent IDs return `404 Not Found`.

---

## Getting Started

### Prerequisites
* **Node.js**: v18.18.0 or higher
* **npm**: v9.0.0 or higher
* **Python**: v3.10, v3.11, or v3.12
* **Git**: Installed and configured

### Clone the Repository

```bash
git clone https://github.com/VaibhavJain2906/Airbnb-Clone-for-Scaler.git
cd Airbnb-Clone-for-Scaler
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create the backend environment file:
   ```bash
   cp .env.example .env
   ```

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Create the frontend environment file:
   ```bash
   cp .env.example .env.local
   ```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
|---|---|---|
| `PROJECT_NAME` | Display title for OpenAPI documentation | `"Airbnb Clone API"` |
| `API_V1_STR` | URL prefix for all API routes | `"/api"` |
| `DATABASE_URL` | SQLAlchemy SQLite connection URI | `"sqlite:///./airbnb.db"` |
| `CORS_ORIGINS` | JSON list of allowed client origins | `["http://localhost:3000","http://127.0.0.1:3000"]` |
| `SERVICE_FEE_PERCENTAGE` | Platform service fee percentage | `0.14` |
| `DEFAULT_PAGE_SIZE` | Default number of items per page | `12` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default / Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:8000/api` |

---

## Database and Seed Data

The application utilizes an SQLite database (`airbnb.db`).

Database initialization and seeding occur **automatically** when the FastAPI server starts up. If the database is empty, the lifespan handler runs `seed_database()` to populate:
* 10 diverse user personas (6 hosts and 4 guests)
* 28 amenities with icons
* 45 realistic properties across 12 international cities with 5+ photos each
* Past and future reservations
* Verified guest reviews
* Initial wishlist items

To manually re-seed or reset the database at any time:
```bash
cd backend
python -m app.seed.seed
```

To run the automated backend integration test suite:
```bash
cd backend
python test_api.py
```

---

## Running the Application

### 1. Start the Backend Server
From the `backend` directory with the virtual environment activated:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
The API is available at `http://localhost:8000`. You can inspect the interactive documentation at `http://localhost:8000/api/docs`.

### 2. Start the Frontend Development Server
From the `frontend` directory:
```bash
npm run dev
```
The frontend is available at `http://localhost:3000`.

---

## Usage

### Browse Listings
Open `http://localhost:3000` to browse properties. Click any category pill (e.g. *Cabins*, *Beachfront*, *Luxe*) to filter listings immediately.

### Search and Filters
Use the search bar in the navigation header to search by city or country name, select guest check-in/check-out dates, and select guest count. Click the **Filters** button to refine by price range, property type, or specific amenities.

### Book a Stay
1. Click any listing card to open its detail page.
2. Select your check-in and check-out dates on the booking widget. Confirmed booking dates are automatically disabled.
3. Review the transparent price calculation showing the nightly rate, cleaning fee, and 14% service fee.
4. Click **Reserve** to enter the checkout flow and confirm your booking.

### Manage Trips
Navigate to **My Trips** from the user menu in the top right to view upcoming, past, and cancelled reservations. Click **Cancel Reservation** on any upcoming stay to release the dates back into inventory.

### Write a Review
On the **My Trips** page under the **Past & Cancelled** tab, click **Write a Review** on completed stays to leave a star rating and feedback.

### Host Mode
1. Click the **Switch User** dropdown in the header and select a host profile (e.g., Marcus Vance, Elena Rostova) or click **Switch to hosting**.
2. Visit `/host` to access the Host Dashboard, view reservation activity, add a new listing, or edit existing property details.

---

## Mock Authentication

To facilitate testing all roles without OAuth or third-party identity providers, the application uses header-based mock authentication:

* The frontend stores the currently selected user profile in `localStorage`.
* Every outgoing request from the centralized API client includes an `X-User-Id` HTTP header.
* The backend dependency `get_current_user` inspects `X-User-Id`, resolves the corresponding database user, and injects it into route handlers.
* Defaults to Sarah Jenkins (`id=7`, standard guest user) when no header is present.
* Route guards verify host status via `require_host` (`current_user.is_host == True`).

---

## Booking and Availability

### Overlap Detection
Double bookings are prevented using interval overlap logic executed within the database transaction:
```sql
existing.check_in < requested.check_out AND existing.check_out > requested.check_in
```
Check-out dates are treated as **exclusive**. A guest checking out on June 10 allows another guest to check in on June 10 without conflict.

### Date Blocking
The `/api/listings/{id}/availability` endpoint delivers all active, confirmed date ranges for a property. The frontend calendar renders these dates as disabled, preventing users from selecting conflicting date ranges.

### Cancellation
Cancelling a reservation updates its status to `cancelled` rather than deleting the record. This frees the date range for new reservations while retaining an audit trail in the database.

---

## Pricing

Pricing is calculated through a centralized pricing service (`backend/app/services/pricing.py`):

$$\text{Base Price} = \text{Nightly Price} \times \text{Nights}$$

$$\text{Service Fee} = \text{Base Price} \times 0.14$$

$$\text{Total Price} = \text{Base Price} + \text{Cleaning Fee} + \text{Service Fee}$$

### Financial Snapshots
When a reservation is created, the exact calculated amounts (`nightly_price`, `nights`, `cleaning_fee`, `service_fee`, `total_price`) are written directly to the `bookings` record. Any subsequent price changes made by the host will not affect existing bookings.

---

## Assumptions and Limitations

* **Mock Authentication**: Authentication relies on the `X-User-Id` request header for evaluation purposes rather than cryptographic JWTs or session cookies.
* **Mock Payments**: Payment processing is simulated. Clicking "Confirm and Pay" reserves the accommodation without charging a real payment card.
* **Database Engine**: The application uses SQLite as specified in the assignment constraints. In high-concurrency production environments, a managed PostgreSQL database would be preferred.
* **Direct Messaging**: In-app host-guest chat is outside the current assessment scope.
* **Static Image Hosting**: Listing images use curated, stable Unsplash URLs rather than an integrated S3 object storage upload pipeline.

---

## Deployment

The application is deployed live and fully functional:

| Component | Platform | URL |
|---|---|---|
| **Frontend Web App** | Vercel | [https://airbnb-clone-for-scaler-lemon.vercel.app/](https://airbnb-clone-for-scaler-lemon.vercel.app/) |
| **Backend REST API** | Railway | [https://airbnb-clone-for-scaler-production.up.railway.app/](https://airbnb-clone-for-scaler-production.up.railway.app/) |
| **Swagger API Docs** | Railway | [https://airbnb-clone-for-scaler-production.up.railway.app/api/docs](https://airbnb-clone-for-scaler-production.up.railway.app/api/docs) |

### Deployment Configuration
* **Frontend**: Hosted on Vercel with automatic Next.js build optimization. Configured with the production environment variable `NEXT_PUBLIC_API_URL=https://airbnb-clone-for-scaler-production.up.railway.app/api`.
* **Backend**: Hosted as a containerized web service on Railway running Uvicorn. Configured with CORS enabled for the production Vercel domain. Database is initialized and seeded automatically during cold start.

---

## Project Status

Completed and verified as a full-stack Airbnb marketplace for the SDE Fullstack assessment. All core guest workflows, host management features, database schemas, and integration test suites are implemented and validated.
