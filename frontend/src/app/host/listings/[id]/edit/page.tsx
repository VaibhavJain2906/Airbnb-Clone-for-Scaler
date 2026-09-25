"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "../../../../../lib/api";
import { ListingDetail } from "../../../../../lib/types";
import { ListingForm } from "../../../../../components/host/ListingForm";
import { Skeleton } from "../../../../../components/ui/Skeleton";

export default function EditListingPage() {
  const params = useParams();
  const listingId = Number(params?.id);
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!listingId) return;

    async function loadListing() {
      try {
        const data = await api.listings.get(listingId);
        setListing(data);
      } catch (err) {
        console.error("Failed to load listing for edit:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadListing();
  }, [listingId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-10 w-64 rounded-xl mb-8" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold">Listing not found</h1>
      </div>
    );
  }

  return <ListingForm initialData={listing} isEdit={true} />;
}
