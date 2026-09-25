import React from "react";
import Image from "next/image";
import { Review } from "../../lib/types";
import { Star, User as UserIcon, Edit3, Sparkles } from "lucide-react";
import { formatDate } from "../../lib/format";

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating?: number | null;
  reviewCount: number;
  onOpenWriteReview?: () => void;
}

export function ReviewsSection({
  reviews,
  averageRating,
  reviewCount,
  onOpenWriteReview,
}: ReviewsSectionProps) {
  // Compute category averages if reviews exist
  const getCategoryAvg = (key: keyof Review): number => {
    const valid = reviews.filter((r) => typeof r[key] === "number") as Review[];
    if (!valid.length) return averageRating ? Math.round(averageRating * 10) / 10 : 4.9;
    const sum = valid.reduce((acc, r) => acc + (Number(r[key]) || 5), 0);
    return Math.round((sum / valid.length) * 10) / 10;
  };

  const categories = [
    { label: "Cleanliness", score: getCategoryAvg("cleanliness") },
    { label: "Accuracy", score: getCategoryAvg("accuracy") },
    { label: "Communication", score: getCategoryAvg("communication") },
    { label: "Location", score: getCategoryAvg("location") },
    { label: "Value", score: getCategoryAvg("value") },
  ];

  return (
    <div id="reviews" className="py-8 border-b border-zinc-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-2xl font-bold text-zinc-900">
            <Star className="w-6 h-6 fill-[#FF385C] text-[#FF385C]" />
            <span>{averageRating ? averageRating.toFixed(2) : "New"}</span>
          </div>
          <span className="text-zinc-400 text-2xl font-bold">·</span>
          <span className="text-2xl font-bold text-zinc-900">
            {reviewCount} review{reviewCount !== 1 ? "s" : ""}
          </span>
        </div>

        {onOpenWriteReview && (
          <button
            onClick={onOpenWriteReview}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer w-fit"
          >
            <Edit3 className="w-4 h-4 text-rose-400" />
            <span>Write a Review</span>
          </button>
        )}
      </div>

      {/* Category Ratings Breakdown Bars */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 mb-10 p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-zinc-700 min-w-[90px]">
                {cat.label}
              </span>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-zinc-900 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (cat.score / 5) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-zinc-900 min-w-[24px] text-right">
                  {cat.score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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
                        ? "fill-[#FF385C] text-[#FF385C]"
                        : "text-zinc-300"
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                {r.comment}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
          <p className="text-sm font-semibold text-zinc-700 mb-1">No reviews yet</p>
          <p className="text-xs text-zinc-500 mb-4">Be the first guest to leave a review for this home!</p>
          {onOpenWriteReview && (
            <button
              onClick={onOpenWriteReview}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Leave the first review
            </button>
          )}
        </div>
      )}
    </div>
  );
}
