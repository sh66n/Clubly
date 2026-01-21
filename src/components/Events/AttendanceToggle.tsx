"use client";
import React from "react";

interface AttendanceToggleProps {
  isPresent: boolean;
  onChange: (makePresent: boolean) => void;
}

export default function AttendanceToggle({
  isPresent,
  onChange,
}: AttendanceToggleProps) {
  return (
    <div className="flex bg-black border border-[#2A2A2A] p-1 rounded-md">
      <button
        onClick={() => onChange(true)}
        className={`px-3 py-1 text-[10px] font-black uppercase tracking-tighter transition-all rounded ${
          isPresent
            ? "bg-green-500/10 text-green-500"
            : "text-gray-600 hover:text-gray-400"
        }`}
      >
        In
      </button>
      <div className="w-px bg-[#2A2A2A] mx-1 self-stretch" />
      <button
        onClick={() => onChange(false)}
        className={`px-3 py-1 text-[10px] font-black uppercase tracking-tighter transition-all rounded ${
          !isPresent
            ? "bg-red-500/10 text-red-400"
            : "text-gray-600 hover:text-gray-400"
        }`}
      >
        Out
      </button>
    </div>
  );
}
