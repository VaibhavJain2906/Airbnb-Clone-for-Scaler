"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "../../hooks/useWishlist";

interface HeartButtonProps {
  listingId: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function HeartButton({
  listingId,
  className = "",
  size = "md",
}: HeartButtonProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(listingId);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listingId);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`relative p-2 rounded-full hover:scale-110 active:scale-90 transition-transform cursor-pointer group ${className}`}
    >
      <Heart
        className={`${sizeClasses[size]} transition-colors duration-200 stroke-[2] ${
          saved
            ? "fill-[#FF385C] text-[#FF385C]"
            : "fill-black/40 text-white group-hover:text-white"
        }`}
      />
    </button>
  );
}
