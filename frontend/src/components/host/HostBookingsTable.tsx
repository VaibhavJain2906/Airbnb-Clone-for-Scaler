import React from "react";
import { Booking } from "../../lib/types";
import { formatDateRange, formatCurrency } from "../../lib/format";
import Link from "next/link";

interface HostBookingsTableProps {
  bookings: Booking[];
}

export function HostBookingsTable({ bookings }: HostBookingsTableProps) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-zinc-500">
        No guest reservations on your listings yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500 border-b border-zinc-200">
          <tr>
            <th className="py-3 px-4">Reservation #</th>
            <th className="py-3 px-4">Listing</th>
            <th className="py-3 px-4">Guest</th>
            <th className="py-3 px-4">Dates</th>
            <th className="py-3 px-4">Guests</th>
            <th className="py-3 px-4">Total Payout</th>
            <th className="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-zinc-50/60 transition-colors">
              <td className="py-3 px-4 font-mono text-xs text-zinc-500">#{b.id}</td>

              <td className="py-3 px-4 font-semibold text-zinc-900 max-w-xs truncate">
                <Link
                  href={`/rooms/${b.listing_id}`}
                  className="hover:underline hover:text-[#FF385C]"
                >
                  {b.listing_title}
                </Link>
              </td>

              <td className="py-3 px-4 text-zinc-700">{b.guest_name}</td>

              <td className="py-3 px-4 text-zinc-600 text-xs">
                {formatDateRange(b.check_in, b.check_out)} ({b.nights}n)
              </td>

              <td className="py-3 px-4 text-zinc-600">{b.guests}</td>

              <td className="py-3 px-4 font-semibold text-zinc-900">
                {formatCurrency(b.total_price)}
              </td>

              <td className="py-3 px-4">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    b.status === "confirmed"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {b.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
