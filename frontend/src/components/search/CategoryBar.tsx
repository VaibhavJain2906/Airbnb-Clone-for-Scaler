"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Palmtree,
  Home,
  Castle,
  Trees,
  Waves,
  Mountain,
  Box,
  Sparkles,
  Snowflake,
  Compass,
} from "lucide-react";
import { api } from "../../lib/api";
import { Category } from "../../lib/types";
import { useSearchFilters } from "../../hooks/useSearchFilters";

const ICON_MAP: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-6 h-6" />,
  Palmtree: <Palmtree className="w-6 h-6" />,
  Home: <Home className="w-6 h-6" />,
  Castle: <Castle className="w-6 h-6" />,
  Trees: <Trees className="w-6 h-6" />,
  Waves: <Waves className="w-6 h-6" />,
  Mountain: <Mountain className="w-6 h-6" />,
  Box: <Box className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Snowflake: <Snowflake className="w-6 h-6" />,
};

export function CategoryBar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { filters, updateFilters } = useSearchFilters();

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await api.meta.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  const selectedCategory = filters.category || "";

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-3 scroll-smooth">
          {/* "All" category button */}
          <button
            onClick={() => updateFilters({ category: undefined })}
            className={`flex flex-col items-center gap-1.5 pb-2 transition-all shrink-0 border-b-2 cursor-pointer ${
              !selectedCategory
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Compass className="w-6 h-6" />
            <span className="text-xs whitespace-nowrap">All Homes</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const icon = ICON_MAP[cat.icon] || <Home className="w-6 h-6" />;

            return (
              <button
                key={cat.id}
                onClick={() =>
                  updateFilters({
                    category: isSelected ? undefined : cat.name,
                  })
                }
                className={`flex flex-col items-center gap-1.5 pb-2 transition-all shrink-0 border-b-2 cursor-pointer ${
                  isSelected
                    ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold opacity-100"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-200 opacity-70 hover:opacity-100"
                }`}
              >
                {icon}
                <span className="text-xs whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
