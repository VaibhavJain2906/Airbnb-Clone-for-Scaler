"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useUser } from "../../context/UserContext";
import { ChevronDown, ShieldCheck, User as UserIcon } from "lucide-react";

export function UserSwitcher() {
  const { currentUser, allUsers, switchUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900 transition-all text-xs font-medium cursor-pointer shadow-xs"
        title="Switch mock user identity"
      >
        <div className="w-5 h-5 rounded-full overflow-hidden relative bg-zinc-100 shrink-0">
          {currentUser.avatar_url ? (
            <Image
              src={currentUser.avatar_url}
              alt={currentUser.name}
              fill
              className="object-cover"
            />
          ) : (
            <UserIcon className="w-3 h-3 text-zinc-400 absolute inset-0 m-auto" />
          )}
        </div>
        <span className="max-w-[100px] truncate">{currentUser.name}</span>
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
            currentUser.is_host
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
          }`}
        >
          {currentUser.is_host ? "Host" : "Guest"}
        </span>
        <ChevronDown className="w-3 h-3 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 animate-fadeIn">
          <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
            Mock User Switcher
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {allUsers.map((u) => {
              const isSelected = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer ${
                    isSelected ? "bg-zinc-50 dark:bg-zinc-800 font-semibold" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full overflow-hidden relative bg-zinc-200 shrink-0">
                      {u.avatar_url ? (
                        <Image src={u.avatar_url} alt={u.name} fill className="object-cover" />
                      ) : (
                        <UserIcon className="w-3.5 h-3.5 text-zinc-400 absolute inset-0 m-auto" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-zinc-900 dark:text-zinc-100 truncate">{u.name}</div>
                      <div className="text-[10px] text-zinc-400">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {u.is_superhost && (
                      <span title="Superhost">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                        u.is_host
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                      }`}
                    >
                      {u.is_host ? "Host" : "Guest"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
