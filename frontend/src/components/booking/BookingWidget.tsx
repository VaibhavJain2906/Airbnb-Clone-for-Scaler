"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { ListingDetail, PriceQuote, DateRangeBlocked } from "../../lib/types";
import { DateRangePicker } from "./DateRangePicker";
import { GuestPicker } from "./GuestPicker";
import { PriceBreakdown } from "./PriceBreakdown";
import { Button } from "../ui/Button";
import { formatCurrency } from "../../lib/format";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

interface BookingWidgetProps {
  listing: ListingDetail;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

export function BookingWidget({
  listing,
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = 1,
}: BookingWidgetProps) {
  const router = useRouter();
  const { error } = useToast();

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  const [blockedRanges, setBlockedRanges] = useState<DateRangeBlocked[]>([]);
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  // Fetch blocked dates
  useEffect(() => {
    async function loadBlocked() {
      try {
        const ranges = await api.listings.getAvailability(listing.id);
        setBlockedRanges(ranges);
      } catch (err) {
        console.error("Failed to load availability:", err);
      }
    }
    loadBlocked();
  }, [listing.id]);

  // Fetch price quote whenever dates change
  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setQuote(null);
      return;
    }

    let isCurrent = true;
    setIsQuoting(true);

    async function loadQuote() {
      try {
        const q = await api.listings.getQuote(listing.id, checkIn, checkOut);
        if (isCurrent) setQuote(q);
      } catch (err: any) {
        if (isCurrent) {
          setQuote(null);
          error(err.message || "Could not calculate price for these dates.");
        }
      } finally {
        if (isCurrent) setIsQuoting(false);
      }
    }

    loadQuote();
    return () => {
      isCurrent = false;
    };
  }, [listing.id, checkIn, checkOut, error]);

  const handleReserve = () => {
    if (!checkIn || !checkOut) {
      error("Please select your check-in and checkout dates.");
      return;
    }
    if (checkOut <= checkIn) {
      error("Checkout date must be after check-in date.");
      return;
    }

    router.push(
      `/book/${listing.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
    );
  };

  return (
    <div className="sticky top-28 bg-white rounded-3xl border border-zinc-200 shadow-xl p-6 flex flex-col gap-4">
      {/* Price Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold text-zinc-900">
            {formatCurrency(listing.price_per_night)}
          </span>
          <span className="text-zinc-500 text-sm"> / night</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-zinc-900">
          <Star className="w-3.5 h-3.5 fill-current text-zinc-900" />
          <span>{listing.average_rating ? listing.average_rating.toFixed(2) : "New"}</span>
          <span className="text-zinc-400">·</span>
          <span className="text-zinc-500 underline font-normal">
            {listing.review_count} review{listing.review_count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Date & Guest Pickers */}
      <div>
        <DateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onChangeCheckIn={setCheckIn}
          onChangeCheckOut={setCheckOut}
          blockedRanges={blockedRanges}
        />

        <GuestPicker
          guests={guests}
          maxGuests={listing.max_guests}
          onChange={setGuests}
        />
      </div>

      {/* Reserve CTA */}
      <Button
        size="lg"
        onClick={handleReserve}
        isLoading={isQuoting}
        className="w-full text-base font-semibold py-3.5"
      >
        Reserve
      </Button>

      <p className="text-center text-xs text-zinc-500 font-medium">
        You won&apos;t be charged yet
      </p>

      {/* Price Quote Breakdown */}
      {quote && <PriceBreakdown quote={quote} />}
    </div>
  );
}
