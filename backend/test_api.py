"""
Comprehensive Test Suite for Airbnb Clone Backend.
Validates:
1. Health check & Metadata
2. Search & Filtering (location, guests, price, categories)
3. Listing details & Ratings
4. Price quote computation
5. Availability & Blocked dates
6. Booking creation with strict overlap validation (409 Conflict)
7. My Trips & Booking cancellation (frees dates)
8. Host dashboard & Host CRUD authorization (403 Forbidden on foreign listings)
9. Wishlist toggle & listing
"""

import sys
from datetime import date, timedelta
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def run_tests():
    print("=== Running Backend Test Suite ===")

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] 1. Health check: OK")

    # 2. Metadata: categories & amenities
    res = client.get("/api/meta/categories")
    assert res.status_code == 200 and len(res.json()) >= 8
    res_amenities = client.get("/api/meta/amenities")
    assert res_amenities.status_code == 200 and len(res_amenities.json()) >= 20
    print(f"[PASS] 2. Metadata: {len(res.json())} categories, {len(res_amenities.json())} amenities")

    # 3. Users list for switcher
    res = client.get("/api/users")
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 10
    host_user = next(u for u in users if u["is_host"])
    guest_user = next(u for u in users if not u["is_host"])
    print(f"[PASS] 3. Users: Found {len(users)} users. Host: {host_user['name']}, Guest: {guest_user['name']}")

    # 4. Listings search with location
    res = client.get("/api/listings?location=Tokyo")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert all("Tokyo" in item["city"] or "Tokyo" in item["title"] for item in data["items"])
    print(f"[PASS] 4. Listings Search (Tokyo): {data['total']} items found")

    # 5. Listings search with price range & guests
    res = client.get("/api/listings?min_price=100&max_price=300&guests=2")
    assert res.status_code == 200
    p_data = res.json()
    for item in p_data["items"]:
        assert 100 <= item["price_per_night"] <= 300
    print(f"[PASS] 5. Listings Search (Price $100-$300, Guests 2): {p_data['total']} items")

    # 6. Listing detail
    listing_id = data["items"][0]["id"]
    res = client.get(f"/api/listings/{listing_id}")
    assert res.status_code == 200
    detail = res.json()
    assert detail["id"] == listing_id
    assert "host" in detail and "amenities" in detail and "images" in detail
    print(f"[PASS] 6. Listing Detail for '{detail['title']}': Host={detail['host']['name']}, Rating={detail['average_rating']}")

    # 7. Price quote computation
    import time
    ts_offset = 100 + int(time.time()) % 500
    check_in = (date.today() + timedelta(days=ts_offset)).isoformat()
    check_out = (date.today() + timedelta(days=ts_offset + 5)).isoformat()
    res = client.get(f"/api/listings/{listing_id}/quote?check_in={check_in}&check_out={check_out}")
    assert res.status_code == 200
    quote = res.json()
    assert quote["nights"] == 5
    assert quote["nightly_price"] == detail["price_per_night"]
    assert quote["base_price"] == round(detail["price_per_night"] * 5, 2)
    assert quote["total_price"] > quote["base_price"]  # includes cleaning + service fee
    print(f"[PASS] 7. Price Quote: 5 nights x ${quote['nightly_price']} = Subtotal ${quote['base_price']}, Total ${quote['total_price']}")

    # 8. Booking creation (Valid reservation)
    booking_payload = {
        "listing_id": listing_id,
        "check_in": check_in,
        "check_out": check_out,
        "guests": 2,
    }
    res = client.post(
        "/api/bookings",
        json=booking_payload,
        headers={"X-User-Id": str(guest_user["id"])},
    )
    assert res.status_code == 201, f"Booking creation failed: {res.text}"
    booking = res.json()
    assert booking["status"] == "confirmed"
    assert booking["nightly_price"] == quote["nightly_price"]
    assert booking["total_price"] == quote["total_price"]
    booking_id = booking["id"]
    print(f"[PASS] 8. Booking Created: ID={booking_id}, Dates={booking['check_in']} to {booking['check_out']}")

    # 9. Overlap validation (MUST return HTTP 409 Conflict)
    # Case A: Exact same dates
    res_overlap1 = client.post(
        "/api/bookings",
        json=booking_payload,
        headers={"X-User-Id": str(guest_user["id"])},
    )
    assert res_overlap1.status_code == 409, f"Expected 409 for identical dates, got {res_overlap1.status_code}"

    # Case B: Partial overlap (starts during existing stay)
    partial_in = (date.today() + timedelta(days=ts_offset + 2)).isoformat()
    partial_out = (date.today() + timedelta(days=ts_offset + 7)).isoformat()
    res_overlap2 = client.post(
        "/api/bookings",
        json={"listing_id": listing_id, "check_in": partial_in, "check_out": partial_out, "guests": 1},
        headers={"X-User-Id": str(guest_user["id"])},
    )
    assert res_overlap2.status_code == 409, f"Expected 409 for partial overlap, got {res_overlap2.status_code}"
    print("[PASS] 9. Overlap Validation: Successfully blocked overlapping bookings with HTTP 409 Conflict")

    # 10. Check that booked dates appear in /availability endpoint
    res_avail = client.get(f"/api/listings/{listing_id}/availability")
    assert res_avail.status_code == 200
    blocked_ranges = res_avail.json()
    assert any(b["check_in"] == check_in and b["check_out"] == check_out for b in blocked_ranges)
    print(f"[PASS] 10. Availability Endpoint: {len(blocked_ranges)} blocked date ranges found, including new booking")

    # 11. My Trips
    res_trips = client.get("/api/bookings/me", headers={"X-User-Id": str(guest_user["id"])})
    assert res_trips.status_code == 200
    trips = res_trips.json()
    assert any(t["id"] == booking_id for t in trips)
    print(f"[PASS] 11. My Trips: Found {len(trips)} trips for {guest_user['name']}")

    # 12. Cancel Booking
    res_cancel = client.post(f"/api/bookings/{booking_id}/cancel", headers={"X-User-Id": str(guest_user["id"])})
    assert res_cancel.status_code == 200
    assert res_cancel.json()["status"] == "cancelled"
    print(f"[PASS] 12. Booking Cancellation: Booking {booking_id} cancelled")

    # 13. Re-booking previously cancelled dates should now succeed!
    res_rebook = client.post(
        "/api/bookings",
        json=booking_payload,
        headers={"X-User-Id": str(guest_user["id"])},
    )
    assert res_rebook.status_code == 201, f"Expected rebooking cancelled dates to succeed, got {res_rebook.status_code}"
    print("[PASS] 13. Re-booking Cancelled Dates: Confirmed cancelled dates do not block new reservations")

    # 14. Wishlist Add, List, and Remove
    # Pick a listing not yet in guest's wishlist (e.g. 2)
    test_wish_id = 2
    # Ensure it's not currently saved
    client.delete(f"/api/wishlist/{test_wish_id}", headers={"X-User-Id": str(guest_user["id"])})
    # Add
    res_w_add = client.post(f"/api/wishlist/{test_wish_id}", headers={"X-User-Id": str(guest_user["id"])})
    assert res_w_add.status_code == 200
    assert res_w_add.json()["is_saved"] is True
    # List
    res_w_list = client.get("/api/wishlist", headers={"X-User-Id": str(guest_user["id"])})
    assert res_w_list.status_code == 200
    assert any(item["id"] == test_wish_id for item in res_w_list.json())
    # Remove
    res_w_rem = client.delete(f"/api/wishlist/{test_wish_id}", headers={"X-User-Id": str(guest_user["id"])})
    assert res_w_rem.status_code == 200
    assert res_w_rem.json()["is_saved"] is False
    print("[PASS] 14. Wishlist: Toggle add, listing, and toggle remove verified")

    # 15. Host Dashboard & Authorization
    res_dash = client.get("/api/host/dashboard", headers={"X-User-Id": str(host_user["id"])})
    assert res_dash.status_code == 200
    dash_data = res_dash.json()
    assert "stats" in dash_data and "listings" in dash_data
    print(f"[PASS] 15. Host Dashboard: {dash_data['stats']['total_listings']} listings, revenue: ${dash_data['stats']['total_revenue']}")

    # 16. Host Security: Guest user attempting host action -> 403 Forbidden
    res_unauth = client.get("/api/host/dashboard", headers={"X-User-Id": str(guest_user["id"])})
    assert res_unauth.status_code == 403, f"Expected 403 for non-host, got {res_unauth.status_code}"
    print("[PASS] 16. Host Security: Non-host correctly blocked with HTTP 403 Forbidden")

    # 17. Host Foreign Listing Modification -> 403 Forbidden
    other_host = next(u for u in users if u["is_host"] and u["id"] != host_user["id"])
    host_listing_id = dash_data["listings"][0]["id"]
    res_foreign = client.put(
        f"/api/host/listings/{host_listing_id}",
        json={"title": "Hacked Title Attempt"},
        headers={"X-User-Id": str(other_host["id"])},
    )
    assert res_foreign.status_code == 403, f"Expected 403 for modifying another host's listing, got {res_foreign.status_code}"
    print("[PASS] 17. Host Ownership: Foreign host blocked from modifying listing with HTTP 403 Forbidden")

    print("\nALL 17 BACKEND TEST CASES PASSED WITH 100% SUCCESS!")


if __name__ == "__main__":
    run_tests()
