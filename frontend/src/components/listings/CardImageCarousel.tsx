"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CardImageCarouselProps {
  images: string[];
  title: string;
}

export function CardImageCarousel({ images, title }: CardImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeImages =
    images && images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        ];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden group bg-zinc-100 dark:bg-zinc-800">
      {/* Current Image */}
      <Image
        src={safeImages[currentIndex]}
        alt={`${title} photo ${currentIndex + 1}`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        priority={false}
      />

      {/* Navigation Arrows (Visible on Group Hover) */}
      {safeImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous photo"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-105 active:scale-95 cursor-pointer z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next photo"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-105 active:scale-95 cursor-pointer z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 pointer-events-none">
            {safeImages.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
