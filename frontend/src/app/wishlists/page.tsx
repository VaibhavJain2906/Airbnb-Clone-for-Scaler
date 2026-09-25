"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { api } from "../../lib/api";
import { ListingCard as ListingCardType } from "../../lib/types";
import { ListingGrid } from "../../components/listings/ListingGrid";
import { EmptyState } from "../../components/ui/EmptyState";
import { useUser } from "../../context/UserContext";

export default function WishlistsPage() {
  const { currentUser } = useUser();
  const [savedListings, setSavedListings] = useState<ListingCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    let isCurrent = true;

    async function loadWishlist() {
      setIsLoading(true);
      try {
        const data = await api.wishlist.getAll();
        if (isCurrent) setSavedListings(data);
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadWishlist();
    return () => {
      isCurrent = false;
    };
  }, [currentUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Wishlists</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Saved stays for {currentUser?.name}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : savedListings.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="As you search, tap the heart icon on any listing to save your favorite stays here."
          icon={<Heart className="w-8 h-8 text-zinc-400" />}
          actionText="Start exploring"
          onAction={() => window.location.assign("/")}
        />
      ) : (
        <ListingGrid listings={savedListings} isLoading={false} />
      )}
    </div>
  );
}
