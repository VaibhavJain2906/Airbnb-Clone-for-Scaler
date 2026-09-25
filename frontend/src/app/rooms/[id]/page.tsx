"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { Star, Share2, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "../../../lib/api";
import { ListingDetail, Review } from "../../../lib/types";
import { PhotoGallery } from "../../../components/listing-detail/PhotoGallery";
import { HostCard } from "../../../components/listing-detail/HostCard";
import { AmenitiesList } from "../../../components/listing-detail/AmenitiesList";
import { ReviewsSection } from "../../../components/listing-detail/ReviewsSection";
import { WriteReviewModal } from "../../../components/listing-detail/WriteReviewModal";
import { BookingWidget } from "../../../components/booking/BookingWidget";
import { HeartButton } from "../../../components/listings/HeartButton";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useToast } from "../../../context/ToastContext";

// Dynamically import InteractiveMap without SSR to support Leaflet in Next.js
const InteractiveMap = dynamic(
  () =>
    import("../../../components/listing-detail/InteractiveMap").then(
      (mod) => mod.InteractiveMap
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-96 rounded-3xl" />,
  }
);

function RoomDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const listingId = Number(params?.id);
  const initialCheckIn = searchParams.get("checkIn") || "";
  const initialCheckOut = searchParams.get("checkOut") || "";
  const initialGuests = Number(searchParams.get("guests")) || 1;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  useEffect(() => {
    if (!listingId) return;

    async function loadData() {
      try {
        const [listingData, reviewsData] = await Promise.all([
          api.listings.get(listingId),
          api.reviews.getForListing(listingId),
        ]);
        setListing(listingData);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Failed to load listing detail:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [listingId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Listing link copied to clipboard!", "success");
    }
  };

  const handleReviewSubmitted = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    if (listing) {
      const newCount = listing.review_count + 1;
      const currentTotal = (listing.average_rating || 5) * listing.review_count;
      const newAvg = Number(((currentTotal + newReview.rating) / newCount).toFixed(2));
      setListing({
        ...listing,
        review_count: newCount,
        average_rating: newAvg,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <Skeleton className="h-8 w-2/3 rounded-xl mb-4" />
        <Skeleton className="h-4 w-1/3 rounded-md mb-6" />
        <Skeleton className="w-full h-96 rounded-3xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <div>
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
        <Link href="/" className="text-[#FF385C] underline font-semibold">
          Return to home explore
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button on mobile */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>
      </div>

      {/* Header Info */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          {listing.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-zinc-900">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#FF385C] text-[#FF385C]" />
              <span>{listing.average_rating ? listing.average_rating.toFixed(2) : "New"}</span>
            </div>
            <span className="text-zinc-400">·</span>
            <a href="#reviews" className="underline font-normal text-zinc-600 hover:text-zinc-900">
              {listing.review_count} review{listing.review_count !== 1 ? "s" : ""}
            </a>
            {listing.host.is_superhost && (
              <>
                <span className="text-zinc-400">·</span>
                <span className="inline-flex items-center gap-1 text-zinc-700 font-medium">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Superhost
                </span>
              </>
            )}
            <span className="text-zinc-400">·</span>
            <span className="underline text-zinc-600">
              {listing.city}, {listing.country}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-xs font-medium text-zinc-700 underline"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <div className="flex items-center gap-1">
              <HeartButton listingId={listing.id} />
              <span className="text-xs font-medium text-zinc-700 underline">Save</span>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <PhotoGallery images={listing.images} title={listing.title} />

      {/* Main Content Layout: 2 Cols on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-10">
        {/* Left Column: Property & Host details */}
        <div className="lg:col-span-2">
          {/* Property capacity overview */}
          <div className="pb-6 border-b border-zinc-200">
            <h2 className="text-xl font-semibold text-zinc-900">
              {listing.property_type} in {listing.city}, {listing.country}
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              {listing.max_guests} guest{listing.max_guests > 1 ? "s" : ""} · {listing.bedrooms} bedroom
              {listing.bedrooms > 1 ? "s" : ""} · {listing.beds} bed{listing.beds > 1 ? "s" : ""} ·{" "}
              {listing.bathrooms} bath{listing.bathrooms > 1 ? "s" : ""}
            </p>
          </div>

          {/* Host Card */}
          <HostCard
            host={listing.host}
            rating={listing.average_rating}
            reviewCount={listing.review_count}
          />

          {/* Description */}
          <div className="py-8 border-b border-zinc-200">
            <h3 className="text-xl font-semibold text-zinc-900 mb-4">About this place</h3>
            <p className="text-sm sm:text-base text-zinc-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <AmenitiesList amenities={listing.amenities} />

          {/* Reviews Section */}
          <ReviewsSection
            reviews={reviews}
            averageRating={listing.average_rating}
            reviewCount={listing.review_count}
            onOpenWriteReview={() => setIsWriteReviewOpen(true)}
          />

          {/* Interactive OpenStreetMap Location Map */}
          <InteractiveMap
            city={listing.city}
            country={listing.country}
            lat={listing.lat}
            lng={listing.lng}
            title={listing.title}
          />
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <BookingWidget
            listing={listing}
            initialCheckIn={initialCheckIn}
            initialCheckOut={initialCheckOut}
            initialGuests={initialGuests}
          />
        </div>
      </div>

      {/* Write a Review Modal */}
      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}

export default function RoomDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-64 rounded-md mb-4" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      }
    >
      <RoomDetailContent />
    </Suspense>
  );
}
