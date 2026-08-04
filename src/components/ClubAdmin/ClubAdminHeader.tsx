"use client";
import React from "react";
import { Search, Bell, Settings } from "lucide-react";

interface ClubAdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export default function ClubAdminHeader({ user }: ClubAdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white px-4 md:px-6 py-3 border-b border-[#e0e0e0]">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Page title */}
        <h1 className="text-xl md:text-2xl font-bold text-[#222]">Dashboard</h1>

        {/* Right: Search, icons, profile */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden sm:flex items-center bg-white border border-[#e0e0e0] rounded-lg px-3 py-2 gap-2 w-56 lg:w-72">
            <Search size={18} className="text-[#999]" />
            <input
              type="text"
              placeholder="Search here…"
              className="bg-transparent text-sm text-[#333] placeholder:text-[#999] outline-none flex-1"
            />
          </div>

          {/* Notification bell */}
          <button className="w-9 h-9 flex items-center justify-center rounded-full border border-[#e0e0e0] bg-white hover:bg-gray-50 transition-colors">
            <Bell size={18} className="text-[#555]" />
          </button>

          {/* Settings */}
          <button className="w-9 h-9 flex items-center justify-center rounded-full border border-[#e0e0e0] bg-white hover:bg-gray-50 transition-colors">
            <Settings size={18} className="text-[#555]" />
          </button>

          {/* User profile pill */}
          <div className="flex items-center gap-2 pl-3 border-l border-[#e0e0e0]">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#e0e0e0] flex items-center justify-center text-sm font-semibold text-[#555]">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-semibold text-[#222] leading-tight">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] font-medium text-[#7CB342] uppercase tracking-wide bg-[#f0f7e6] px-1.5 py-0.5 rounded-sm w-fit leading-tight">
                Club Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
