"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SearchBar } from "../search/SearchBar";
import { FiltersModal } from "../search/FiltersModal";
import { UserSwitcher } from "./UserSwitcher";
import { UserMenu } from "./UserMenu";
import { SlidersHorizontal } from "lucide-react";
import { useUser } from "../../context/UserContext";

export function Navbar() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const { currentUser, becomeHost } = useUser();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* 1. Brand Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <svg
                className="w-8 h-8 text-[#FF385C] group-hover:scale-105 transition-transform"
                viewBox="0 0 32 32"
                fill="currentColor"
              >
                <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.197.11 1.624-.49 3.23-1.656 4.39-1.205 1.205-2.871 1.884-4.57 1.884-2.091 0-4.004-1.024-5.342-2.585l-.921-1.123-.922 1.123C14.74 28.93 12.827 29.954 10.736 29.954c-1.699 0-3.365-.679-4.57-1.884-1.166-1.16-1.766-2.766-1.656-4.39.05-.725.293-1.606.96-3.197l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.285 0-2.296.657-3.414 2.656l-.504.973c-1.92 3.766-6.05 12.417-7.014 14.67l-.14.341c-.615 1.467-.82 2.196-.86 2.784-.078 1.15.348 2.29 1.176 3.118.86 1.11 2.106 1.366 3.494 1.366 1.704 0 3.284-.877 4.336-2.21l1.526-1.933 1.526 1.933c1.052 1.333 2.632 2.21 4.336 2.21 1.388 0 2.634-.256 3.494-1.366.828-.828 1.254-1.968 1.176-3.118-.04-.588-.245-1.317-.86-2.784l-.14-.341c-.964-2.253-5.094-10.904-7.014-14.67l-.504-.973C18.296 3.657 17.285 3 16 3zm0 13c2.209 0 4 1.791 4 4 0 1.636-.983 3.042-2.385 3.658l-.615.228-.615-.228C14.983 23.042 14 21.636 14 20c0-2.209 1.791-4 4-4zm0 2c-1.105 0-2 .895-2 2 0 .848.528 1.572 1.276 1.862l.724.226.724-.226C17.472 21.572 18 20.848 18 20c0-1.105-.895-2-2-2z" />
              </svg>
              <span className="text-xl font-bold tracking-tight text-[#FF385C] hidden md:inline">
                airbnb
              </span>
            </Link>

            {/* 2. Interactive Search Bar */}
            <div className="flex-1 flex justify-center max-w-xl">
              <SearchBar onOpenModal={() => setIsFilterModalOpen(true)} />
            </div>

            {/* 3. Right Action Section */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {currentUser?.is_host ? (
                <Link
                  href="/host"
                  className="hidden lg:inline-flex text-xs font-semibold px-3.5 py-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Switch to hosting
                </Link>
              ) : (
                <button
                  onClick={becomeHost}
                  className="hidden lg:inline-flex text-xs font-semibold px-3.5 py-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Airbnb your home
                </button>
              )}

              {/* Filters button on smaller screens */}
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-xs font-medium cursor-pointer"
                title="Filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              <UserSwitcher />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Global Filter & Search Modal */}
      <FiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />
    </>
  );
}
