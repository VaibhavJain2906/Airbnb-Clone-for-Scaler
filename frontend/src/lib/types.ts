export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  is_host: boolean;
  is_superhost: boolean;
  created_at?: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
}

export interface ListingCard {
  id: number;
  title: string;
  property_type: string;
  category: string;
  city: string;
  country: string;
  price_per_night: number;
  images: string[];
  average_rating?: number | null;
  review_count: number;
  is_superhost: boolean;
}

export interface ListingDetail {
  id: number;
  title: string;
  description: string;
  property_type: string;
  category: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  images: string[];
  amenities: Amenity[];
  host: User;
  average_rating?: number | null;
  review_count: number;
}

export interface ListingCreateInput {
  title: string;
  description: string;
  property_type: string;
  category: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  image_urls: string[];
  amenity_ids: number[];
}

export type ListingUpdateInput = Partial<ListingCreateInput>;

export interface ListingPagination {
  items: ListingCard[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DateRangeBlocked {
  check_in: string;
  check_out: string;
}

export interface PriceQuote {
  nightly_price: number;
  nights: number;
  base_price: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
}

export interface Booking {
  id: number;
  listing_id: number;
  listing_title: string;
  listing_city: string;
  listing_country: string;
  listing_image?: string | null;
  guest_id: number;
  guest_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  nightly_price: number;
  nights: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: "confirmed" | "cancelled" | "completed" | string;
  created_at: string;
}

export interface BookingCreateInput {
  listing_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}

export interface Review {
  id: number;
  listing_id: number;
  author_id: number;
  author_name: string;
  author_avatar?: string | null;
  rating: number;
  cleanliness?: number;
  accuracy?: number;
  communication?: number;
  location?: number;
  value?: number;
  comment: string;
  created_at: string;
}

export interface ReviewCreateInput {
  listing_id: number;
  booking_id?: number;
  rating: number;
  cleanliness?: number;
  accuracy?: number;
  communication?: number;
  location?: number;
  value?: number;
  comment: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface SearchFilters {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  category?: string;
  amenities?: number[];
  page?: number;
}

export interface HostDashboardData {
  stats: {
    total_listings: number;
    upcoming_reservations: number;
    total_reservations: number;
    total_revenue: number;
  };
  listings: ListingCard[];
  bookings: Booking[];
}
