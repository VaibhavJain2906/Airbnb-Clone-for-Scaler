import {
  ListingPagination,
  ListingDetail,
  DateRangeBlocked,
  PriceQuote,
  Booking,
  BookingCreateInput,
  ListingCreateInput,
  ListingUpdateInput,
  User,
  Category,
  Amenity,
  Review,
  ReviewCreateInput,
  HostDashboardData,
  ListingCard,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get active mock user ID from localStorage if in browser
  let userId = "7";
  if (typeof window !== "undefined") {
    userId = localStorage.getItem("airbnb_user_id") || "7";
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-User-Id": userId,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    let errorData = null;
    try {
      errorData = await response.json();
      if (errorData && errorData.detail) {
        errorDetail = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // response wasn't JSON
    }
    throw new ApiError(errorDetail, response.status, errorData);
  }

  return response.json() as Promise<T>;
}

export const api = {
  listings: {
    search: (params: Record<string, any> = {}): Promise<ListingPagination> => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      return request<ListingPagination>(`/listings${qs ? `?${qs}` : ""}`);
    },

    get: (id: number): Promise<ListingDetail> => {
      return request<ListingDetail>(`/listings/${id}`);
    },

    getAvailability: (id: number): Promise<DateRangeBlocked[]> => {
      return request<DateRangeBlocked[]>(`/listings/${id}/availability`);
    },

    getQuote: (id: number, checkIn: string, checkOut: string): Promise<PriceQuote> => {
      return request<PriceQuote>(`/listings/${id}/quote?check_in=${checkIn}&check_out=${checkOut}`);
    },
  },

  bookings: {
    create: (input: BookingCreateInput): Promise<Booking> => {
      return request<Booking>("/bookings", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },

    myTrips: (): Promise<Booking[]> => {
      return request<Booking[]>("/bookings/me");
    },

    cancel: (id: number): Promise<{ id: number; status: string; message: string }> => {
      return request<{ id: number; status: string; message: string }>(`/bookings/${id}/cancel`, {
        method: "POST",
      });
    },
  },

  host: {
    getDashboard: (): Promise<HostDashboardData> => {
      return request<HostDashboardData>("/host/dashboard");
    },

    getListings: (): Promise<ListingCard[]> => {
      return request<ListingCard[]>("/host/listings");
    },

    createListing: (data: ListingCreateInput): Promise<ListingDetail> => {
      return request<ListingDetail>("/host/listings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    updateListing: (id: number, data: ListingUpdateInput): Promise<ListingDetail> => {
      return request<ListingDetail>(`/host/listings/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    deleteListing: (id: number): Promise<{ id: number; message: string }> => {
      return request<{ id: number; message: string }>(`/host/listings/${id}`, {
        method: "DELETE",
      });
    },
  },

  wishlist: {
    getAll: (): Promise<ListingCard[]> => {
      return request<ListingCard[]>("/wishlist");
    },

    toggle: (listingId: number): Promise<{ listing_id: number; is_saved: boolean; message: string }> => {
      return request<{ listing_id: number; is_saved: boolean; message: string }>(`/wishlist/${listingId}`, {
        method: "POST",
      });
    },

    remove: (listingId: number): Promise<{ listing_id: number; is_saved: boolean; message: string }> => {
      return request<{ listing_id: number; is_saved: boolean; message: string }>(`/wishlist/${listingId}`, {
        method: "DELETE",
      });
    },
  },

  users: {
    getAll: (): Promise<User[]> => {
      return request<User[]>("/users");
    },

    me: (): Promise<User> => {
      return request<User>("/users/me");
    },

    becomeHost: (): Promise<User> => {
      return request<User>("/users/become-host", {
        method: "POST",
      });
    },
  },

  meta: {
    getCategories: (): Promise<Category[]> => {
      return request<Category[]>("/meta/categories");
    },

    getAmenities: (): Promise<Amenity[]> => {
      return request<Amenity[]>("/meta/amenities");
    },
  },

  reviews: {
    getForListing: (listingId: number): Promise<Review[]> => {
      return request<Review[]>(`/reviews/listing/${listingId}`);
    },

    create: (input: ReviewCreateInput): Promise<Review> => {
      return request<Review>("/reviews", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
  },
};
