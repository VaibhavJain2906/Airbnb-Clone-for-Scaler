"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, X, Sparkles, Check } from "lucide-react";
import { api } from "../../lib/api";
import { Review } from "../../lib/types";
import { Button } from "../ui/Button";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  listingTitle: string;
  onReviewSubmitted: (review: Review) => void;
}

const CATEGORIES = [
  { key: "cleanliness", label: "Cleanliness", desc: "Was the place sparkling clean?" },
  { key: "accuracy", label: "Accuracy", desc: "Did photos match the actual space?" },
  { key: "communication", label: "Communication", desc: "Did the host respond promptly?" },
  { key: "location", label: "Location", desc: "Was the neighborhood safe and convenient?" },
  { key: "value", label: "Value", desc: "Was it worth the nightly rate?" },
] as const;

export function WriteReviewModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const { currentUser } = useUser();
  const { showToast } = useToast();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    value: 5,
  });
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleCategoryChange = (key: string, score: number) => {
    setCategoryScores((prev) => ({ ...prev, [key]: score }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      setErrorMsg("Please write at least 5 characters sharing your experience.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const newReview = await api.reviews.create({
        listing_id: listingId,
        rating,
        cleanliness: categoryScores.cleanliness,
        accuracy: categoryScores.accuracy,
        communication: categoryScores.communication,
        location: categoryScores.location,
        value: categoryScores.value,
        comment: comment.trim(),
      });

      showToast("Thank you! Your verified review has been published.", "success");
      onReviewSubmitted(newReview);
      onClose();
      // Reset form
      setComment("");
      setRating(5);
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      setErrorMsg(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-100 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Write a Review</h2>
            <p className="text-xs text-zinc-500 line-clamp-1">{listingTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Persona Card */}
          {currentUser && (
            <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-200 shrink-0">
                {currentUser.avatar_url ? (
                  <Image
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-zinc-600 text-sm">
                    {currentUser.name[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">Posting as {currentUser.name}</p>
                <p className="text-[11px] text-zinc-500">Verified Guest · Your review will appear publicly</p>
              </div>
            </div>
          )}

          {/* Overall Star Rating */}
          <div className="text-center py-2 space-y-2">
            <label className="text-sm font-bold text-zinc-900">Overall Rating</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating ?? rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 cursor-pointer transition-transform hover:scale-115 focus:outline-hidden"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        active
                          ? "fill-[#FF385C] text-[#FF385C]"
                          : "text-zinc-300 hover:text-zinc-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-semibold text-zinc-600">
              {rating === 5 && "⭐ Outstanding experience!"}
              {rating === 4 && "✨ Very good stay"}
              {rating === 3 && "👌 Average experience"}
              {rating === 2 && "⚠️ Below expectations"}
              {rating === 1 && "❌ Disappointing"}
            </p>
          </div>

          {/* Detailed Category Ratings */}
          <div className="space-y-3 pt-3 border-t border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Category Breakdown
            </h3>
            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const currentScore = categoryScores[cat.key] || 5;
                return (
                  <div
                    key={cat.key}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <div>
                      <span className="font-semibold text-zinc-800">{cat.label}</span>
                      <p className="text-[11px] text-zinc-400">{cat.desc}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleCategoryChange(cat.key, s)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            s === currentScore
                              ? "bg-zinc-900 text-white shadow-xs"
                              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Written Comment */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <div className="flex justify-between items-center">
              <label htmlFor="review-comment" className="text-xs font-bold text-zinc-800">
                Your Review
              </label>
              <span className="text-[11px] text-zinc-400">{comment.length} / 1500</span>
            </div>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={1500}
              placeholder="What made your stay special? Mention the host, amenities, location, or atmosphere..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs sm:text-sm p-3.5 border border-zinc-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#FF385C]/30 focus:border-[#FF385C] transition-all resize-none placeholder:text-zinc-400"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              className="bg-[#FF385C] hover:bg-[#E00B41] text-white font-semibold"
            >
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
