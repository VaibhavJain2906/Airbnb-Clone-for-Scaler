"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useSearchFilters } from "../../hooks/useSearchFilters";
import { api } from "../../lib/api";
import { Amenity } from "../../lib/types";
import { Plus, Minus, MapPin, Calendar, DollarSign, Home, Sparkles } from "lucide-react";

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROPERTY_TYPES = [
  "All",
  "Apartment",
  "Villa",
  "Cabin",
  "Loft",
  "Townhouse",
  "Penthouse",
  "Chalet",
  "Condo",
  "Tiny Home",
];

export function FiltersModal({ isOpen, onClose }: FiltersModalProps) {
  const { filters, updateFilters, clearFilters } = useSearchFilters();
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([]);

  // Local draft state for filters
  const [location, setLocation] = useState(filters.location || "");
  const [checkIn, setCheckIn] = useState(filters.check_in || "");
  const [checkOut, setCheckOut] = useState(filters.check_out || "");
  const [guests, setGuests] = useState(filters.guests || 1);
  const [minPrice, setMinPrice] = useState<string>(filters.min_price ? String(filters.min_price) : "");
  const [maxPrice, setMaxPrice] = useState<string>(filters.max_price ? String(filters.max_price) : "");
  const [propertyType, setPropertyType] = useState(filters.property_type || "All");
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(filters.amenities || []);

  // Fetch all amenities for checkboxes
  useEffect(() => {
    async function loadAmenities() {
      try {
        const data = await api.meta.getAmenities();
        setAmenitiesList(data);
      } catch (err) {
        console.error("Failed to load amenities:", err);
      }
    }
    if (isOpen) {
      loadAmenities();
    }
  }, [isOpen]);

  // Sync draft state whenever filters prop changes
  useEffect(() => {
    if (isOpen) {
      setLocation(filters.location || "");
      setCheckIn(filters.check_in || "");
      setCheckOut(filters.check_out || "");
      setGuests(filters.guests || 1);
      setMinPrice(filters.min_price ? String(filters.min_price) : "");
      setMaxPrice(filters.max_price ? String(filters.max_price) : "");
      setPropertyType(filters.property_type || "All");
      setSelectedAmenities(filters.amenities || []);
    }
  }, [isOpen, filters]);

  const toggleAmenity = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    updateFilters({
      location: location.trim() || undefined,
      check_in: checkIn || undefined,
      check_out: checkOut || undefined,
      guests: guests > 1 ? guests : undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      property_type: propertyType !== "All" ? propertyType : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    clearFilters();
    setLocation("");
    setCheckIn("");
    setCheckOut("");
    setGuests(1);
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("All");
    setSelectedAmenities([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filters & Search" maxWidth="2xl">
      <div className="space-y-6">
        {/* 1. Destination */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            <MapPin className="w-4 h-4 text-[#FF385C]" /> Where to?
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search destination (e.g. Tokyo, Paris, Bali, New York)"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF385C]"
          />
        </div>

        {/* 2. Dates */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            <Calendar className="w-4 h-4 text-[#FF385C]" /> Stay dates
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-zinc-500 block mb-1">Check-in</span>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF385C]"
              />
            </div>
            <div>
              <span className="text-xs text-zinc-500 block mb-1">Check-out</span>
              <input
                type="date"
                value={checkOut}
                min={checkIn || undefined}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF385C]"
              />
            </div>
          </div>
        </div>

        {/* 3. Guests */}
        <div className="flex items-center justify-between py-2 border-y border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Guests</div>
            <div className="text-xs text-zinc-500">Number of travelers</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests(Math.max(1, guests - 1))}
              disabled={guests <= 1}
              className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:border-zinc-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-semibold">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests(guests + 1)}
              className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:border-zinc-900 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Price Range */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            <DollarSign className="w-4 h-4 text-[#FF385C]" /> Price range (per night)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-zinc-500 block mb-1">Minimum ($)</span>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="50"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF385C]"
              />
            </div>
            <div>
              <span className="text-xs text-zinc-500 block mb-1">Maximum ($)</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="500"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF385C]"
              />
            </div>
          </div>
        </div>

        {/* 5. Property Type */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            <Home className="w-4 h-4 text-[#FF385C]" /> Property type
          </label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => {
              const isSelected = propertyType.toLowerCase() === type.toLowerCase();
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPropertyType(type)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Amenities */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            <Sparkles className="w-4 h-4 text-[#FF385C]" /> Amenities
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {amenitiesList.map((a) => {
              const isChecked = selectedAmenities.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                    isChecked
                      ? "border-[#FF385C] bg-rose-50/50 dark:bg-rose-950/20 text-zinc-900 dark:text-zinc-100 font-medium"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleAmenity(a.id)}
                    className="rounded text-[#FF385C] focus:ring-[#FF385C]"
                  />
                  <span className="truncate">{a.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:underline cursor-pointer"
          >
            Clear all
          </button>
          <Button onClick={handleApply} className="px-6 py-2.5">
            Show places
          </Button>
        </div>
      </div>
    </Modal>
  );
}
