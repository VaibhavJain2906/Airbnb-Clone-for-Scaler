"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ListingCard } from "../../lib/types";
import { formatCurrency } from "../../lib/format";
import { Star, Edit3, Trash2, Eye, AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

interface HostListingTableProps {
  listings: ListingCard[];
  onRefresh: () => void;
}

export function HostListingTable({ listings, onRefresh }: HostListingTableProps) {
  const { success, error } = useToast();
  const [deletingListing, setDeletingListing] = useState<ListingCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deletingListing) return;
    setIsDeleting(true);
    try {
      await api.host.deleteListing(deletingListing.id);
      success("Listing successfully deleted.");
      setDeletingListing(null);
      onRefresh();
    } catch (err: any) {
      error(err.message || "Failed to delete listing.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!listings || listings.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-zinc-500">
        You haven't created any listings yet.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500 border-b border-zinc-200">
            <tr>
              <th className="py-3 px-4">Listing</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Price / Night</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {listings.map((l) => (
              <tr key={l.id} className="hover:bg-zinc-50/60 transition-colors">
                {/* Image & Title */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                      {l.images[0] && (
                        <Image src={l.images[0]} alt={l.title} fill className="object-cover" />
                      )}
                    </div>
                    <span className="font-semibold text-zinc-900 line-clamp-1 max-w-xs">
                      {l.title}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-4 text-zinc-600">
                  {l.city}, {l.country}
                </td>

                <td className="py-3 px-4 text-zinc-600">{l.property_type}</td>

                <td className="py-3 px-4 font-semibold text-zinc-900">
                  {formatCurrency(l.price_per_night)}
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3.5 h-3.5 fill-current text-zinc-900" />
                    <span>{l.average_rating ? l.average_rating.toFixed(2) : "New"}</span>
                    <span className="text-zinc-400">({l.review_count})</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/rooms/${l.id}`}
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                      title="View Public Page"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/host/listings/${l.id}/edit`}
                      className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Listing"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setDeletingListing(l)}
                      className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingListing}
        onClose={() => setDeletingListing(null)}
        title="Delete Listing"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              Are you sure you want to permanently delete{" "}
              <strong>"{deletingListing?.title}"</strong>?
            </span>
          </div>

          <p className="text-xs text-zinc-500">
            This action cannot be undone. You will not be able to delete this listing if there are active
            or upcoming reservations.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button
              variant="outline"
              onClick={() => setDeletingListing(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
