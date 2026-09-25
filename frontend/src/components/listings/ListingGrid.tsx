"use client";

import React from "react";
import { ListingCard as ListingCardType } from "../../lib/types";
import { ListingCard } from "./ListingCard";
import { ListingCardSkeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";

interface ListingGridProps {
  listings: ListingCardType[];
  isLoading: boolean;
  onClearFilters?: () => void;
}

export function ListingGrid({
  listings,
  isLoading,
  onClearFilters,
}: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <EmptyState
        title="No exact matches found"
        description="Try changing or clearing some of your filters or searching a different destination."
        actionText="Clear all filters"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
