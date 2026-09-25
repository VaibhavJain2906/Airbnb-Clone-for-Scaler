import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl ${className}`}
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Image square */}
      <Skeleton className="w-full aspect-square rounded-2xl" />
      {/* Title & rating row */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-3/5 rounded-md" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </div>
      {/* Subtitles */}
      <Skeleton className="h-3.5 w-2/5 rounded-md" />
      <Skeleton className="h-4 w-1/3 rounded-md mt-1" />
    </div>
  );
}
