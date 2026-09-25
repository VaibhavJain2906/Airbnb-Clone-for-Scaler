import React from "react";
import Image from "next/image";
import { User } from "../../lib/types";
import { ShieldCheck, Star, Award, User as UserIcon } from "lucide-react";

interface HostCardProps {
  host: User;
  rating?: number | null;
  reviewCount: number;
}

export function HostCard({ host, rating, reviewCount }: HostCardProps) {
  return (
    <div className="flex items-center gap-4 py-6 border-b border-zinc-200">
      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-zinc-100 shrink-0">
        {host.avatar_url ? (
          <Image src={host.avatar_url} alt={host.name} fill className="object-cover" />
        ) : (
          <UserIcon className="w-8 h-8 text-zinc-400 absolute inset-0 m-auto" />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-zinc-900">
            Hosted by {host.name}
          </h2>
          {host.is_superhost && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-[#FF385C]"
              title="Superhost"
            >
              <Award className="w-3 h-3" /> Superhost
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
          {host.is_superhost ? (
            <span>Superhosts are experienced, highly rated hosts.</span>
          ) : (
            <span>Identity verified host</span>
          )}
        </div>
      </div>
    </div>
  );
}
