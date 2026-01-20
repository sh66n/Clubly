"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, Calendar, Star, ChevronDown, CalendarRange } from "lucide-react";

export default function ScheduleDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-black border border-[#515151] text-white rounded-xl hover:bg-[#1A1A1A] transition-all active:scale-95"
      >
        <Plus
          size={18}
          className={`transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
        />
        <span className="text-sm font-medium">Schedule</span>
        <ChevronDown size={14} className="opacity-50" />
      </button>

      {/* Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-black border border-[#515151] shadow-2xl z-50 overflow-hidden">
          <div className="p-1">
            <Link
              href="/events/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              <Calendar size={16} className="text-gray-500" />
              <span>Event</span>
            </Link>

            <Link
              href="/superevents/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              <CalendarRange size={16} className="text-gray-500" />
              <span>Super Event</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
