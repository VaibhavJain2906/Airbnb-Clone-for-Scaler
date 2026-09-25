"use client";

import React from "react";
import { Search } from "lucide-react";
import { useSearchFilters } from "../../hooks/useSearchFilters";
import { formatDateRange } from "../../lib/format";

interface SearchBarProps {
  onOpenModal: () => void;
}

export function SearchBar({ onOpenModal }: SearchBarProps) {
  const { filters } = useSearchFilters();

  const locationLabel = filters.location ? filters.location : "Anywhere";

  const dateLabel =
    filters.check_in && filters.check_out
      ? formatDateRange(filters.check_in, filters.check_out)
      : "Any week";

  const guestsLabel =
    filters.guests && filters.guests > 0
      ? `${filters.guests} guest${filters.guests > 1 ? "s" : ""}`
      : "Add guests";

  return (
    <div
      onClick={onOpenModal}
      className="flex items-center divide-x divide-zinc-200 dark:divide-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-full py-2 px-4 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white dark:bg-zinc-900 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 max-w-md w-full justify-between"
    >
      <div className="px-3 truncate text-zinc-900 dark:text-zinc-100 font-medium">
        {locationLabel}
      </div>
      <div className="px-3 truncate text-zinc-600 dark:text-zinc-300 font-medium hidden xs:block">
        {dateLabel}
      </div>
      <div className="flex items-center gap-3 pl-3">
        <span className="text-zinc-500 font-normal truncate hidden sm:block">
          {guestsLabel}
        </span>
        <div className="w-8 h-8 rounded-full bg-[#FF385C] text-white flex items-center justify-center shrink-0">
          <Search className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
}
