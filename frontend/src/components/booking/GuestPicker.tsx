"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Minus } from "lucide-react";

interface GuestPickerProps {
  guests: number;
  maxGuests: number;
  onChange: (val: number) => void;
}

export function GuestPicker({ guests, maxGuests, onChange }: GuestPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative border border-zinc-300 rounded-xl p-3 bg-white mt-2 cursor-pointer" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-800">
            Guests
          </label>
          <div className="text-xs font-medium text-zinc-900 mt-0.5">
            {guests} guest{guests > 1 ? "s" : ""}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-zinc-200 p-4 z-30 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900">Total Guests</div>
              <div className="text-xs text-zinc-500">Max {maxGuests} guests</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onChange(Math.max(1, guests - 1))}
                disabled={guests <= 1}
                className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600 hover:border-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center text-sm font-semibold text-zinc-900">{guests}</span>
              <button
                type="button"
                onClick={() => onChange(Math.min(maxGuests, guests + 1))}
                disabled={guests >= maxGuests}
                className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600 hover:border-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
