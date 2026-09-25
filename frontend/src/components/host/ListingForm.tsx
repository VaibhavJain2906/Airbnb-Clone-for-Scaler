"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { ListingDetail, ListingCreateInput, Amenity, Category } from "../../lib/types";
import { Button } from "../ui/Button";
import { useToast } from "../../context/ToastContext";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ListingFormProps {
  initialData?: ListingDetail;
  isEdit?: boolean;
}

const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Cabin",
  "Loft",
  "Townhouse",
  "Penthouse",
  "Chalet",
  "Condo",
  "Tiny Home",
  "House",
];

export function ListingForm({ initialData, isEdit = false }: ListingFormProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [propertyType, setPropertyType] = useState(initialData?.property_type || "Apartment");
  const [category, setCategory] = useState(initialData?.category || "Iconic Cities");
  const [city, setCity] = useState(initialData?.city || "");
  const [country, setCountry] = useState(initialData?.country || "");
  const [lat, setLat] = useState(initialData?.lat ? String(initialData.lat) : "0.0");
  const [lng, setLng] = useState(initialData?.lng ? String(initialData.lng) : "0.0");
  const [pricePerNight, setPricePerNight] = useState(
    initialData?.price_per_night ? String(initialData.price_per_night) : "150"
  );
  const [cleaningFee, setCleaningFee] = useState(
    initialData?.cleaning_fee ? String(initialData.cleaning_fee) : "45"
  );
  const [maxGuests, setMaxGuests] = useState(initialData?.max_guests || 2);
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms || 1);
  const [beds, setBeds] = useState(initialData?.beds || 1);
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms || 1.0);

  // Photos
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
        ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  // Amenities
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>(
    initialData?.amenities ? initialData.amenities.map((a) => a.id) : []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [amenities, categories] = await Promise.all([
          api.meta.getAmenities(),
          api.meta.getCategories(),
        ]);
        setAvailableAmenities(amenities);
        setAvailableCategories(categories);
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    }
    loadMeta();
  }, []);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImageUrls((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (id: number) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imageUrls.length === 0) {
      error("Please provide at least one photo for this listing.");
      return;
    }

    setIsSubmitting(true);
    const payload: ListingCreateInput = {
      title,
      description,
      property_type: propertyType,
      category,
      city,
      country,
      lat: Number(lat) || 0.0,
      lng: Number(lng) || 0.0,
      price_per_night: Number(pricePerNight),
      cleaning_fee: Number(cleaningFee),
      max_guests: Number(maxGuests),
      bedrooms: Number(bedrooms),
      beds: Number(beds),
      bathrooms: Number(bathrooms),
      image_urls: imageUrls,
      amenity_ids: selectedAmenityIds,
    };

    try {
      if (isEdit && initialData) {
        await api.host.updateListing(initialData.id, payload);
        success("Listing updated successfully!");
        router.push("/host");
      } else {
        const created = await api.host.createListing(payload);
        success("Listing published successfully!");
        router.push(`/rooms/${created.id}`);
      }
    } catch (err: any) {
      error(err.message || "Failed to save listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/host"
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-700" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {isEdit ? "Edit Listing" : "Create a new listing"}
          </h1>
          <p className="text-sm text-zinc-500">
            {isEdit ? "Update details for this property" : "Step into hosting on Airbnb"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* 1. Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 border-b pb-2">
            1. Property Overview
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Minimalist Loft in Shibuya"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF385C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
              Description
            </label>
            <textarea
              required
              rows={4}
              minLength={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what makes your space special, nearby attractions, and amenities..."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF385C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF385C] bg-white cursor-pointer"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF385C] bg-white cursor-pointer"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Location */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 border-b pb-2">
            2. Location Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Tokyo"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF385C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Country
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Japan"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF385C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 3. Pricing & Capacity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 border-b pb-2">
            3. Pricing & Capacity
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Price / Night ($)
              </label>
              <input
                type="number"
                min="1"
                required
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Cleaning Fee ($)
              </label>
              <input
                type="number"
                min="0"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Max Guests
              </label>
              <input
                type="number"
                min="1"
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                min="1"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Beds
              </label>
              <input
                type="number"
                min="1"
                value={beds}
                onChange={(e) => setBeds(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        {/* 4. Photos */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 border-b pb-2">
            4. Photos ({imageUrls.length})
          </h2>

          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste photo URL (https://images.unsplash.com/...)"
              className="flex-1 px-4 py-2 rounded-xl border border-zinc-300 text-xs"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddImage}>
              <Plus className="w-4 h-4" /> Add Photo
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {imageUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-4/3 rounded-xl overflow-hidden border border-zinc-200 group bg-zinc-100"
              >
                <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                    Cover Photo
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-white text-rose-600 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Amenities */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 border-b pb-2">
            5. Amenities Included
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
            {availableAmenities.map((a) => {
              const checked = selectedAmenityIds.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    checked
                      ? "border-[#FF385C] bg-rose-50/40 text-zinc-900 font-semibold"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAmenity(a.id)}
                    className="rounded text-[#FF385C] focus:ring-[#FF385C]"
                  />
                  <span className="truncate">{a.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-zinc-200 flex items-center justify-between">
          <Link href="/host">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="lg" isLoading={isSubmitting} className="px-8">
            {isEdit ? "Save Changes" : "Publish Listing"}
          </Button>
        </div>
      </form>
    </div>
  );
}
