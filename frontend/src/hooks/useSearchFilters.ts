"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { SearchFilters } from "../lib/types";

export function useSearchFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse current URL params into SearchFilters
  const filters: SearchFilters = useMemo(() => {
    const location = searchParams.get("location") || undefined;
    const check_in = searchParams.get("check_in") || undefined;
    const check_out = searchParams.get("check_out") || undefined;
    const guests = searchParams.get("guests") ? Number(searchParams.get("guests")) : undefined;
    const min_price = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined;
    const max_price = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;
    const property_type = searchParams.get("property_type") || undefined;
    const category = searchParams.get("category") || undefined;
    const amenitiesParam = searchParams.get("amenities");
    const amenities = amenitiesParam ? amenitiesParam.split(",").map(Number).filter(Boolean) : undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

    return {
      location,
      check_in,
      check_out,
      guests,
      min_price,
      max_price,
      property_type,
      category,
      amenities,
      page,
    };
  }, [searchParams]);

  // Update query params in URL
  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      // If filters change (except page), reset page to 1
      if (!("page" in newFilters)) {
        params.set("page", "1");
      }

      Object.entries(newFilters).forEach(([key, val]) => {
        if (val === undefined || val === null || val === "" || val === "all") {
          params.delete(key);
        } else if (Array.isArray(val)) {
          if (val.length > 0) {
            params.set(key, val.join(","));
          } else {
            params.delete(key);
          }
        } else {
          params.set(key, String(val));
        }
      });

      const qs = params.toString();
      const targetPath = pathname === "/" ? "/" : "/";
      router.push(`${targetPath}${qs ? `?${qs}` : ""}`);
    },
    [searchParams, router, pathname]
  );

  const clearFilters = useCallback(() => {
    router.push("/");
  }, [router]);

  return {
    filters,
    updateFilters,
    clearFilters,
  };
}
