"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "../../context/UserContext";
import { Menu, User as UserIcon, Heart, Compass, LayoutDashboard, PlusCircle, Sparkles } from "lucide-react";

export function UserMenu() {
  const { currentUser, becomeHost } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pl-3 rounded-full border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-zinc-900"
        aria-label="User navigation menu"
      >
        <Menu className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
        <div className="w-7 h-7 rounded-full overflow-hidden relative bg-zinc-700 text-white flex items-center justify-center">
          {currentUser?.avatar_url ? (
            <Image src={currentUser.avatar_url} alt={currentUser.name} fill className="object-cover" />
          ) : (
            <UserIcon className="w-4 h-4" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 animate-fadeIn text-sm">
          {/* Guest Links */}
          <Link
            href="/trips"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium transition-colors"
          >
            <Compass className="w-4 h-4 text-zinc-500" />
            My Trips
          </Link>
          <Link
            href="/wishlists"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium transition-colors"
          >
            <Heart className="w-4 h-4 text-zinc-500" />
            Wishlists
          </Link>

          <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />

          {/* Host Links */}
          {currentUser?.is_host ? (
            <>
              <Link
                href="/host"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                Host Dashboard
              </Link>
              <Link
                href="/host/listings/new"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-zinc-500" />
                Create New Listing
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                becomeHost();
                setIsOpen(false);
              }}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FF385C]" />
              Become a Host
            </button>
          )}

          <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />

          <Link
            href="/messages"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            Messages (Coming Soon)
          </Link>
        </div>
      )}
    </div>
  );
}
