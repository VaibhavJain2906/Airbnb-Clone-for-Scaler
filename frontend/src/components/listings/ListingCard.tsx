"use client";

import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { ListingCard as ListingCardType } from "../../lib/types";
import { CardImageCarousel } from "./CardImageCarousel";
import { HeartButton } from "./HeartButton";
import { formatCurrency } from "../../lib/format";

interface ListingCardProps {
  listing: ListingCardType;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <div className="group relative flex flex-col gap-2.5">
      {/* 1. Image Carousel & Wishlist Button */}
      <div className="relative">
        <Link href={`/rooms/${listing.id}`} className="block">
          <CardImageCarousel images={listing.images} title={listing.title} />
        </Link>
        <div className="absolute top-2.5 right-2.5 z-20">
          <HeartButton listingId={listing.id} />
        </div>
      </div>

      {/* 2. Text Details */}
      <Link href={`/rooms/${listing.id}`} className="flex flex-col gap-0.5 cursor-pointer">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">
            {listing.city}, {listing.country}
          </span>
          <div className="flex items-center gap-1 text-xs font-medium shrink-0 text-zinc-900 dark:text-zinc-100">
            <Star className="w-3.5 h-3.5 fill-current text-zinc-900 dark:text-zinc-100" />
            <span>{listing.average_rating ? listing.average_rating.toFixed(2) : "New"}</span>
          </div>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          {listing.property_type} · {listing.category}
        </p>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          {listing.title}
        </p>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            {formatCurrency(listing.price_per_night)}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">night</span>
        </div>
      </Link>
    </div>
  );
}
