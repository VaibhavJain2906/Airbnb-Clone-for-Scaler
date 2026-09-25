"use client";

import React from "react";
import { DateRangeBlocked } from "../../lib/types";

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onChangeCheckIn: (val: string) => void;
  onChangeCheckOut: (val: string) => void;
  blockedRanges: DateRangeBlocked[];
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onChangeCheckIn,
  onChangeCheckOut,
  blockedRanges,
}: DateRangePickerProps) {
  // Helper to check if a date is within any blocked range
  const isDateBlocked = (dateStr: string) => {
    return blockedRanges.some((range) => {
      return dateStr >= range.check_in && dateStr < range.check_out;
    });
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="border border-zinc-300 rounded-xl overflow-hidden divide-y divide-zinc-200">
      <div className="grid grid-cols-2 divide-x divide-zinc-200">
        {/* Check-In */}
        <div className="p-3 bg-white">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-800">
            Check-in
          </label>
          <input
            type="date"
            min={todayStr}
            value={checkIn}
            onChange={(e) => {
              const val = e.target.value;
              onChangeCheckIn(val);
              // If check-out is before new check-in, reset check-out
              if (checkOut && checkOut <= val) {
                onChangeCheckOut("");
              }
            }}
            className="w-full text-xs font-medium text-zinc-900 bg-transparent focus:outline-hidden mt-0.5 cursor-pointer"
          />
        </div>

        {/* Check-Out */}
        <div className="p-3 bg-white">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-800">
            Checkout
          </label>
          <input
            type="date"
            min={checkIn || todayStr}
            value={checkOut}
            onChange={(e) => onChangeCheckOut(e.target.value)}
            className="w-full text-xs font-medium text-zinc-900 bg-transparent focus:outline-hidden mt-0.5 cursor-pointer"
          />
        </div>
      </div>

      {blockedRanges.length > 0 && (
        <div className="px-3 py-1.5 bg-amber-50 text-[11px] text-amber-800 font-medium">
          {blockedRanges.length} date range{blockedRanges.length > 1 ? "s" : ""} booked by other guests
        </div>
      )}
    </div>
  );
}
