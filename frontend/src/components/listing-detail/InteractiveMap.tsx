"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, ZoomIn, ZoomOut, Compass } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  city: string;
  country: string;
  lat: number;
  lng: number;
  title: string;
}

export function InteractiveMap({
  city,
  country,
  lat,
  lng,
  title,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map centered at listing coordinates
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: false, // Custom controls instead
        scrollWheelZoom: false, // Prevent accidental scrolling while browsing
      });

      // Standard OpenStreetMap tiles (100% free, community-powered, no API key required)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom pulsing Airbnb pin
      const customIcon = L.divIcon({
        className: "custom-airbnb-marker",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 52px;
              height: 52px;
              border-radius: 50%;
              background-color: rgba(255, 56, 92, 0.25);
              animation: airbnb-pulse 2s infinite ease-out;
            "></div>
            <div style="
              position: relative;
              width: 42px;
              height: 42px;
              background-color: #FF385C;
              border: 3px solid #ffffff;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      // Add marker with popup
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="padding: 4px; font-family: inherit;">
          <h4 style="font-weight: 700; font-size: 13px; margin: 0 0 4px; color: #18181b;">${city}, ${country}</h4>
          <p style="font-size: 11px; margin: 0; color: #71717a;">Exact location provided after booking.</p>
        </div>
      `);

      mapInstanceRef.current = map;
      setIsLoaded(true);

      // Invalidate size after mount animation
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, city, country]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
    }
  };

  return (
    <div className="py-8">
      <style jsx global>{`
        @keyframes airbnb-pulse {
          0% {
            transform: scale(0.7);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        .leaflet-tile-pane {
          filter: saturate(0.88) contrast(1.02) brightness(1.02);
        }
        .custom-airbnb-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid #f4f4f5 !important;
        }
        .leaflet-container {
          font-family: inherit !important;
        }
      `}</style>

      <div className="mb-4">
        <h3 className="text-xl font-semibold text-zinc-900">Where you&apos;ll be</h3>
        <p className="text-sm text-zinc-600 mt-1">
          {city}, {country}
        </p>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-96 rounded-3xl overflow-hidden border border-zinc-200 shadow-sm group">
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-zinc-100" />

        {/* Loading Overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-zinc-100 flex items-center justify-center z-10 animate-pulse">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold">
              <Compass className="w-5 h-5 animate-spin" /> Loading interactive map...
            </div>
          </div>
        )}

        {/* Map Floating Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-zinc-200/80 p-1.5">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-700 transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-700 transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-zinc-200 my-0.5" />
          <button
            onClick={handleResetCenter}
            className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-700 transition-colors cursor-pointer"
            title="Center on Property"
            aria-label="Center on Property"
          >
            <Navigation className="w-4 h-4 text-[#FF385C]" />
          </button>
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-800 shadow-md border border-zinc-200/60">
          <MapPin className="w-3.5 h-3.5 text-[#FF385C] fill-current" />
          <span>
            {city}, {country}
          </span>
          <span className="text-zinc-400 font-mono text-[11px]">
            ({lat.toFixed(3)}, {lng.toFixed(3)})
          </span>
        </div>
      </div>
      <p className="text-xs text-zinc-500 mt-3">
        Explore neighborhood surroundings by dragging or using the controls. Precise address is provided upon booking confirmation.
      </p>
    </div>
  );
}
