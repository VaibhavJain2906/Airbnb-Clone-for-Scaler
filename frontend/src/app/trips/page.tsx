"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Compass, Calendar, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api";
import { Booking } from "../../lib/types";
import { formatDateRange, formatCurrency } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { useToast } from "../../context/ToastContext";
import { useUser } from "../../context/UserContext";

export default function MyTripsPage() {
  const { currentUser } = useUser();
  const { success, error } = useToast();

  const [trips, setTrips] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (!currentUser) return;
    let isCurrent = true;

    async function loadTrips() {
      setIsLoading(true);
      try {
        const data = await api.bookings.myTrips();
        if (isCurrent) setTrips(data);
      } catch (err) {
        console.error("Failed to load user trips:", err);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadTrips();
    return () => {
      isCurrent = false;
    };
  }, [currentUser]);

  const todayStr = new Date().toISOString().split("T")[0];

  const upcomingTrips = trips.filter(
    (t) => t.check_out >= todayStr && t.status === "confirmed"
  );
  const pastTrips = trips.filter(
    (t) => t.check_out < todayStr || t.status === "cancelled"
  );

  const displayedTrips = activeTab === "upcoming" ? upcomingTrips : pastTrips;

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsCancelLoading(true);
    try {
      await api.bookings.cancel(cancellingBooking.id);
      success("Reservation cancelled. The blocked dates have been released.");
      setTrips((prev) =>
        prev.map((t) =>
          t.id === cancellingBooking.id ? { ...t, status: "cancelled" } : t
        )
      );
      setCancellingBooking(null);
    } catch (err: any) {
      error(err.message || "Failed to cancel reservation.");
    } finally {
      setIsCancelLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Trips</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Reservations and travel history for {currentUser?.name}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "upcoming"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Upcoming ({upcomingTrips.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "past"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Past & Cancelled ({pastTrips.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-zinc-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : displayedTrips.length === 0 ? (
        <EmptyState
          title={
            activeTab === "upcoming"
              ? "No trips booked... yet!"
              : "No past trips to display"
          }
          description="Time to dust off your bags and start planning your next great adventure."
          icon={<Compass className="w-8 h-8 text-zinc-500" />}
          actionText="Start searching"
          onAction={() => window.location.assign("/")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTrips.map((booking) => {
            const isCancelled = booking.status === "cancelled";
            return (
              <div
                key={booking.id}
                className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-48 bg-zinc-100">
                    {booking.listing_image && (
                      <Image
                        src={booking.listing_image}
                        alt={booking.listing_title}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider shadow-xs ${
                          isCancelled
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-xs font-semibold text-zinc-500">
                      {booking.listing_city}, {booking.listing_country}
                    </span>
                    <h3 className="font-bold text-zinc-900 text-base line-clamp-1">
                      {booking.listing_title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-zinc-600 mt-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{formatDateRange(booking.check_in, booking.check_out)}</span>
                      <span>·</span>
                      <span>
                        {booking.nights} night{booking.nights > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-500">
                      {booking.guests} guest{booking.guests > 1 ? "s" : ""} · Total:{" "}
                      <strong className="text-zinc-900 text-sm">
                        {formatCurrency(booking.total_price)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-zinc-100 mt-4 flex items-center justify-between gap-3">
                  <Link
                    href={`/rooms/${booking.listing_id}`}
                    className="text-xs font-semibold text-zinc-800 hover:text-[#FF385C] underline"
                  >
                    View Listing
                  </Link>

                  {!isCancelled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancellingBooking(booking)}
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancellingBooking}
        onClose={() => setCancellingBooking(null)}
        title="Cancel Reservation"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl text-rose-800 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              Are you sure you want to cancel this reservation for{" "}
              <strong>{cancellingBooking?.listing_title}</strong>?
            </span>
          </div>

          <p className="text-xs text-zinc-500">
            Cancelling will release the dates for other travelers. The booking will remain in your
            historical records with status "cancelled".
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button
              variant="outline"
              onClick={() => setCancellingBooking(null)}
              disabled={isCancelLoading}
            >
              Keep Reservation
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              isLoading={isCancelLoading}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
