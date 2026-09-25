import React from "react";
import { MapPin } from "lucide-react";

interface StaticMapProps {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export function StaticMap({ city, country, lat, lng }: StaticMapProps) {
  return (
    <div className="py-8">
      <h3 className="text-xl font-semibold text-zinc-900 mb-2">Where you'll be</h3>
      <p className="text-sm text-zinc-600 mb-6">
        {city}, {country}
      </p>

      {/* Styled Interactive/Static Map Canvas */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center shadow-inner group">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"
        />

        {/* Center Pin Indicator */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#FF385C] text-white flex items-center justify-center shadow-xl ring-4 ring-white animate-bounce">
            <MapPin className="w-6 h-6 fill-current text-white" />
          </div>
          <div className="mt-2 px-3 py-1 bg-white rounded-full text-xs font-semibold text-zinc-900 shadow-md border border-zinc-100">
            {city}
          </div>
        </div>

        {/* Lat / Lng badge */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] text-zinc-500 font-mono shadow-xs border border-zinc-200">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
