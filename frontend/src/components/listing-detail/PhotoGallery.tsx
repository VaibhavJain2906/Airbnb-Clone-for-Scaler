"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Grid, X } from "lucide-react";
import { Modal } from "../ui/Modal";

interface PhotoGalleryProps {
  images: string[];
  title: string;
}

export function PhotoGallery({ images, title }: PhotoGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const safeImages =
    images && images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        ];

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden mt-6">
        {/* Desktop 5-photo grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[320px] sm:h-[420px] md:h-[480px]">
          {/* Main Cover Photo */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="relative md:col-span-2 md:row-span-2 cursor-pointer overflow-hidden group"
          >
            <Image
              src={safeImages[0]}
              alt={`${title} cover`}
              fill
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Secondary 4 photos */}
          {safeImages.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              onClick={() => setIsModalOpen(true)}
              className="relative hidden md:block cursor-pointer overflow-hidden group"
            >
              <Image
                src={img}
                alt={`${title} photo ${idx + 2}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* "Show all photos" button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-3.5 py-2 bg-white/95 hover:bg-white text-zinc-900 rounded-xl text-xs font-semibold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-zinc-200"
        >
          <Grid className="w-4 h-4" /> Show all {safeImages.length} photos
        </button>
      </div>

      {/* Full Screen Photo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="All Photos"
        maxWidth="4xl"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
          {safeImages.map((img, idx) => (
            <div key={idx} className="relative w-full aspect-16/10 rounded-2xl overflow-hidden bg-zinc-100">
              <Image
                src={img}
                alt={`${title} gallery photo ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
