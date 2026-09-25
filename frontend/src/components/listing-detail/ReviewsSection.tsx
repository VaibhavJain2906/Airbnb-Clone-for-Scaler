import React from "react";
import Image from "next/image";
import { Review } from "../../lib/types";
import { Star, User as UserIcon } from "lucide-react";
import { formatDate } from "../../lib/format";

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating?: number | null;
  reviewCount: number;
}

export function ReviewsSection({
  reviews,
  averageRating,
  reviewCount,
}: ReviewsSectionProps) {
  return (
    <div className="py-8 border-b border-zinc-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-1.5 text-2xl font-bold text-zinc-900">
          <Star className="w-6 h-6 fill-current text-zinc-900" />
          <span>{averageRating ? averageRating.toFixed(2) : "New"}</span>
        </div>
        <span className="text-zinc-400 text-2xl font-bold">·</span>
        <span className="text-2xl font-bold text-zinc-900">
          {reviewCount} review{reviewCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Reviews Grid */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((r) => (
            <div key={r.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-100 shrink-0">
                  {r.author_avatar ? (
                    <Image
                      src={r.author_avatar}
                      alt={r.author_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-zinc-400 absolute inset-0 m-auto" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900">{r.author_name}</div>
                  <div className="text-xs text-zinc-500">{formatDate(r.created_at)}</div>
                </div>
              </div>

              {/* Rating stars */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < r.rating
                        ? "fill-current text-zinc-900"
                        : "text-zinc-300"
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-zinc-700 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">No reviews yet for this listing.</p>
      )}
    </div>
  );
}
