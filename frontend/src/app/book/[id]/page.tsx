"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Star, ShieldCheck, CheckCircle2 } from "lucide-react";
import { api } from "../../../lib/api";
import { ListingDetail, PriceQuote, Booking } from "../../../lib/types";
import { formatCurrency, formatDateRange, calculateNights } from "../../../lib/format";
import { Button } from "../../../components/ui/Button";
import { useToast } from "../../../context/ToastContext";
import { useUser } from "../../../context/UserContext";

function CheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { error, success } = useToast();
  const { currentUser } = useUser();

  const listingId = Number(params?.id);
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = Number(searchParams.get("guests")) || 1;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Mock payment fields
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [zipCode, setZipCode] = useState("94103");

  useEffect(() => {
    if (!listingId || !checkIn || !checkOut) return;

    async function loadData() {
      try {
        const [listingData, quoteData] = await Promise.all([
          api.listings.get(listingId),
          api.listings.getQuote(listingId, checkIn, checkOut),
        ]);
        setListing(listingData);
        setQuote(quoteData);
      } catch (err: any) {
        error(err.message || "Failed to load checkout details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [listingId, checkIn, checkOut, error]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || !checkIn || !checkOut) return;

    setIsSubmitting(true);
    try {
      const res = await api.bookings.create({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guests: guests,
      });

      setConfirmedBooking(res);
      success("Reservation confirmed successfully! Enjoy your trip.");
    } catch (err: any) {
      error(
        err.message ||
          "This property is no longer available for the selected dates. Please pick another date range."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Loading state
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 w-64 bg-zinc-200 rounded-md mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-80 bg-zinc-200 rounded-3xl" />
          <div className="h-80 bg-zinc-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  // 2. Success state
  if (confirmedBooking && listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 mb-2">You're going to {listing.city}!</h1>
        <p className="text-zinc-500 text-sm mb-6">
          Reservation #{confirmedBooking.id} is confirmed. A receipt has been saved under your profile.
        </p>

        {/* Receipt Card */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-left space-y-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-200 shrink-0">
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 text-base">{listing.title}</h2>
              <p className="text-xs text-zinc-500">
                {listing.city}, {listing.country}
              </p>
              <div className="mt-1 text-xs font-semibold text-[#FF385C]">
                Status: {confirmedBooking.status.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-zinc-500 block">Dates</span>
              <span className="font-semibold text-zinc-800">
                {formatDateRange(confirmedBooking.check_in, confirmedBooking.check_out)}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Guests</span>
              <span className="font-semibold text-zinc-800">
                {confirmedBooking.guests} guest{confirmedBooking.guests > 1 ? "s" : ""}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Total Paid</span>
              <span className="font-bold text-zinc-900 text-sm">
                {formatCurrency(confirmedBooking.total_price)}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Booked By</span>
              <span className="font-semibold text-zinc-800">{currentUser?.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link href="/trips">
            <Button size="lg" className="px-8">
              View in My Trips
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">
              Explore More Places
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!listing || !quote) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid checkout request</h1>
        <Link href="/" className="text-[#FF385C] underline font-semibold">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-700" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          Request to book
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left Column: Trip details and Mock payment form */}
        <form onSubmit={handleConfirmBooking} className="space-y-8">
          {/* Trip Summary */}
          <div className="space-y-4 pb-6 border-b border-zinc-200">
            <h2 className="text-xl font-semibold text-zinc-900">Your trip</h2>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-900">Dates</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {formatDateRange(checkIn, checkOut)} ({calculateNights(checkIn, checkOut)} nights)
                </div>
              </div>
              <Link
                href={`/rooms/${listing.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                className="text-xs font-semibold text-zinc-900 underline hover:text-[#FF385C]"
              >
                Edit
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-900">Guests</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {guests} guest{guests > 1 ? "s" : ""}
                </div>
              </div>
              <Link
                href={`/rooms/${listing.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                className="text-xs font-semibold text-zinc-900 underline hover:text-[#FF385C]"
              >
                Edit
              </Link>
            </div>
          </div>

          {/* Mock Payment Form */}
          <div className="space-y-4 pb-6 border-b border-zinc-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900">Pay with</h2>
              <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">
                Mock Checkout
              </span>
            </div>

            <div className="border border-zinc-300 rounded-xl overflow-hidden divide-y divide-zinc-200 bg-white">
              <div className="p-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Card number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full text-sm font-medium text-zinc-900 focus:outline-hidden mt-0.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 divide-x divide-zinc-200">
                <div className="p-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Expiration
                  </label>
                  <input
                    type="text"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full text-sm font-medium text-zinc-900 focus:outline-hidden mt-0.5"
                    required
                  />
                </div>
                <div className="p-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full text-sm font-medium text-zinc-900 focus:outline-hidden mt-0.5"
                    required
                  />
                </div>
              </div>

              <div className="p-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  ZIP code
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full text-sm font-medium text-zinc-900 focus:outline-hidden mt-0.5"
                  required
                />
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="space-y-2 pb-6 border-b border-zinc-200 text-xs text-zinc-600">
            <h3 className="font-semibold text-zinc-900 text-sm">Ground rules</h3>
            <p>
              We ask every guest to remember a few simple things about what makes a great guest:
              Follow house rules, treat your Host's home like your own, and respect the check-in time.
            </p>
          </div>

          {/* Submit CTA */}
          <div>
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              className="w-full text-base py-4 font-bold"
            >
              Confirm and pay {formatCurrency(quote.total_price)}
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 mt-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Secured backend overlap & availability validation</span>
            </div>
          </div>
        </form>

        {/* Right Column: Sticky Price & Listing Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl space-y-6 sticky top-28">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 shrink-0">
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs text-zinc-500 truncate">
                {listing.property_type} in {listing.city}
              </span>
              <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 mt-0.5">
                {listing.title}
              </h3>
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-900 mt-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{listing.average_rating ? listing.average_rating.toFixed(2) : "New"}</span>
                <span className="text-zinc-500 font-normal">
                  ({listing.review_count} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-zinc-200 pt-4 space-y-3 text-sm">
            <h4 className="font-semibold text-zinc-900 text-base">Price details</h4>

            <div className="flex items-center justify-between text-zinc-600">
              <span>
                {formatCurrency(quote.nightly_price)} × {quote.nights} nights
              </span>
              <span>{formatCurrency(quote.base_price)}</span>
            </div>

            {quote.cleaning_fee > 0 && (
              <div className="flex items-center justify-between text-zinc-600">
                <span>Cleaning fee</span>
                <span>{formatCurrency(quote.cleaning_fee)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-zinc-600">
              <span>Airbnb service fee (14%)</span>
              <span>{formatCurrency(quote.service_fee)}</span>
            </div>

            <div className="border-t border-zinc-200 pt-3 flex items-center justify-between font-bold text-base text-zinc-900">
              <span>Total (USD)</span>
              <span>{formatCurrency(quote.total_price)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="h-8 w-48 bg-zinc-200 animate-pulse rounded-md mx-auto mb-8" />
          <div className="h-64 bg-zinc-200 animate-pulse rounded-3xl" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
