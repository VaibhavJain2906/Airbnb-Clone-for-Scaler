"use client";

import React, { useEffect, useState, Suspense } from "react";
import { CategoryBar } from "../components/search/CategoryBar";
import { ListingGrid } from "../components/listings/ListingGrid";
import { useSearchFilters } from "../hooks/useSearchFilters";
import { api } from "../lib/api";
import { ListingCard as ListingCardType } from "../lib/types";
import { Button } from "../components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

function ExploreContent() {
  const { filters, updateFilters, clearFilters } = useSearchFilters();
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    async function fetchListings() {
      try {
        const res = await api.listings.search({
          location: filters.location,
          check_in: filters.check_in,
          check_out: filters.check_out,
          guests: filters.guests,
          min_price: filters.min_price,
          max_price: filters.max_price,
          property_type: filters.property_type,
          category: filters.category,
          amenities: filters.amenities ? filters.amenities.join(",") : undefined,
          page: filters.page || 1,
          page_size: 12,
        });

        if (isCurrent) {
          setListings(res.items);
          setTotal(res.total);
          setTotalPages(res.total_pages);
        }
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    fetchListings();

    return () => {
      isCurrent = false;
    };
  }, [filters]);

  const currentPage = filters.page || 1;

  return (
    <div>
      <CategoryBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count & Active Filter Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-zinc-500 font-medium">
            {!isLoading && (
              <span>
                Showing <strong className="text-zinc-900">{listings.length}</strong> of{" "}
                <strong className="text-zinc-900">{total}</strong> places
                {filters.location && ` in "${filters.location}"`}
                {filters.category && ` · ${filters.category}`}
              </span>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        <ListingGrid
          listings={listings}
          isLoading={isLoading}
          onClearFilters={clearFilters}
        />

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-14">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateFilters({ page: currentPage - 1 })}
              className="gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            <span className="text-sm font-medium text-zinc-600">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateFilters({ page: currentPage + 1 })}
              className="gap-1.5"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-8 w-48 bg-zinc-200 animate-pulse rounded-md mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
