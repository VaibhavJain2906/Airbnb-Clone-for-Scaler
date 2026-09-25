"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";

export function useWishlist() {
  const { currentUser } = useUser();
  const { showToast } = useToast();
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch wishlisted listings whenever the active user changes
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;

    async function loadWishlist() {
      setIsLoading(true);
      try {
        const items = await api.wishlist.getAll();
        if (isMounted) {
          setSavedIds(new Set(items.map((item) => item.id)));
        }
      } catch (err) {
        console.error("Failed to load wishlist items:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadWishlist();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const isWishlisted = useCallback((listingId: number) => savedIds.has(listingId), [savedIds]);

  const toggleWishlist = useCallback(
    async (listingId: number) => {
      // Optimistic update
      const wasSaved = savedIds.has(listingId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(listingId);
        else next.add(listingId);
        return next;
      });

      try {
        const res = await api.wishlist.toggle(listingId);
        showToast(res.message, "info");
      } catch (err: any) {
        // Rollback on failure
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(listingId);
          else next.delete(listingId);
          return next;
        });
        showToast("Failed to update wishlist.", "error");
      }
    },
    [savedIds, showToast]
  );

  return {
    savedIds,
    isWishlisted,
    toggleWishlist,
    isLoading,
  };
}
