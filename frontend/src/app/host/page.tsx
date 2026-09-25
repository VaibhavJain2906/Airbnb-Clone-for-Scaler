"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Home, CalendarCheck, DollarSign, Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import { HostDashboardData } from "../../lib/types";
import { formatCurrency } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { HostListingTable } from "../../components/host/HostListingTable";
import { HostBookingsTable } from "../../components/host/HostBookingsTable";
import { useUser } from "../../context/UserContext";

export default function HostDashboardPage() {
  const { currentUser, becomeHost } = useUser();
  const [data, setData] = useState<HostDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "bookings">("listings");

  const loadDashboard = useCallback(async () => {
    if (!currentUser || !currentUser.is_host) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.host.getDashboard();
      setData(res);
    } catch (err) {
      console.error("Failed to load host dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Non-host upgrade screen
  if (currentUser && !currentUser.is_host) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-[#FF385C] flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-3">
          Become a Host on Airbnb
        </h1>
        <p className="text-zinc-600 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          You are currently signed in as a Guest ({currentUser.name}). Upgrade your mock account
          to unlock hosting tools, property creation, and reservation management.
        </p>
        <Button size="lg" onClick={becomeHost} className="px-8">
          Upgrade to Host Account
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Host Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Welcome back, {currentUser?.name}
          </p>
        </div>

        <Link href="/host/listings/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Create New Listing
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Listings
            </div>
            <div className="text-2xl font-bold text-zinc-900 mt-0.5">
              {data?.stats.total_listings ?? 0}
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Active Bookings
            </div>
            <div className="text-2xl font-bold text-zinc-900 mt-0.5">
              {data?.stats.upcoming_reservations ?? 0}
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Earnings
            </div>
            <div className="text-2xl font-bold text-zinc-900 mt-0.5">
              {formatCurrency(data?.stats.total_revenue ?? 0)}
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              All Reservations
            </div>
            <div className="text-2xl font-bold text-zinc-900 mt-0.5">
              {data?.stats.total_reservations ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="flex items-center border-b border-zinc-200 px-6 pt-2">
          <button
            onClick={() => setActiveTab("listings")}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === "listings"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Your Properties ({data?.listings.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === "bookings"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Guest Reservations ({data?.bookings.length ?? 0})
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="h-48 bg-zinc-50 animate-pulse rounded-xl" />
          ) : activeTab === "listings" ? (
            <HostListingTable listings={data?.listings || []} onRefresh={loadDashboard} />
          ) : (
            <HostBookingsTable bookings={data?.bookings || []} />
          )}
        </div>
      </div>
    </div>
  );
}
