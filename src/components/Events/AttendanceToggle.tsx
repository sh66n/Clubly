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
    <div className="flex gap-1 rounded-lg overflow-hidden border border-gray-700">
      <button
        onClick={() => onChange(true)}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          isPresent
            ? "bg-green-600 text-white"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
        }`}
      >
        Present
      </button>
      <button
        onClick={() => onChange(false)}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          !isPresent
            ? "bg-red-600 text-white"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
        }`}
      >
        Absent
      </button>
    </div>
  );
}
