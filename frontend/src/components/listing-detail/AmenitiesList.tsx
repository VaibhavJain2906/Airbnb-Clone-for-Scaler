import React from "react";
import { Amenity } from "../../lib/types";
import {
  Wifi,
  Laptop,
  Tv,
  UtensilsCrossed,
  Shirt,
  Wind,
  Car,
  AirVent,
  Flame,
  Droplets,
  Bath,
  SunMedium,
  Armchair,
  Footprints,
  MountainSnow,
  Zap,
  Dumbbell,
  Baby,
  Smile,
  Bell,
  ShieldAlert,
  Cross,
  PawPrint,
  KeyRound,
  Briefcase,
  Sparkle,
  Sparkles,
} from "lucide-react";

interface AmenitiesListProps {
  amenities: Amenity[];
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  Wifi: <Wifi className="w-5 h-5 text-zinc-600" />,
  Laptop: <Laptop className="w-5 h-5 text-zinc-600" />,
  Tv: <Tv className="w-5 h-5 text-zinc-600" />,
  UtensilsCrossed: <UtensilsCrossed className="w-5 h-5 text-zinc-600" />,
  Shirt: <Shirt className="w-5 h-5 text-zinc-600" />,
  Wind: <Wind className="w-5 h-5 text-zinc-600" />,
  Car: <Car className="w-5 h-5 text-zinc-600" />,
  AirVent: <AirVent className="w-5 h-5 text-zinc-600" />,
  Flame: <Flame className="w-5 h-5 text-zinc-600" />,
  Droplets: <Droplets className="w-5 h-5 text-zinc-600" />,
  Bath: <Bath className="w-5 h-5 text-zinc-600" />,
  SunMedium: <SunMedium className="w-5 h-5 text-zinc-600" />,
  Armchair: <Armchair className="w-5 h-5 text-zinc-600" />,
  Footprints: <Footprints className="w-5 h-5 text-zinc-600" />,
  MountainSnow: <MountainSnow className="w-5 h-5 text-zinc-600" />,
  Zap: <Zap className="w-5 h-5 text-zinc-600" />,
  Dumbbell: <Dumbbell className="w-5 h-5 text-zinc-600" />,
  Baby: <Baby className="w-5 h-5 text-zinc-600" />,
  Smile: <Smile className="w-5 h-5 text-zinc-600" />,
  Bell: <Bell className="w-5 h-5 text-zinc-600" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-zinc-600" />,
  Cross: <Cross className="w-5 h-5 text-zinc-600" />,
  PawPrint: <PawPrint className="w-5 h-5 text-zinc-600" />,
  KeyRound: <KeyRound className="w-5 h-5 text-zinc-600" />,
  Briefcase: <Briefcase className="w-5 h-5 text-zinc-600" />,
  Sparkle: <Sparkle className="w-5 h-5 text-zinc-600" />,
};

export function AmenitiesList({ amenities }: AmenitiesListProps) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <div className="py-8 border-b border-zinc-200">
      <h3 className="text-xl font-semibold text-zinc-900 mb-6">
        What this place offers
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {amenities.map((a) => {
          const icon = AMENITY_ICONS[a.icon] || <Sparkles className="w-5 h-5 text-zinc-600" />;
          return (
            <div key={a.id} className="flex items-center gap-4 text-sm text-zinc-800">
              <span className="shrink-0">{icon}</span>
              <span>{a.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
