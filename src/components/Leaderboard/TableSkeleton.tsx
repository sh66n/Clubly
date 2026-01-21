import React from "react";

export default function TableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-black h-[40%] flex flex-col rounded-lg border border-[#515151] relative z-10 animate-pulse">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-b-[#515151]">
        <div className="h-5 sm:h-7 w-24 bg-gray-800 rounded" />
      </div>

      {/* Table body */}
      <div className="overflow-y-hidden flex-1">
        <table className="w-full">
          <tbody>
            {Array.from({ length: rows }).map((_, index) => (
              <tr
                key={index}
                className="border-b border-[#515151] flex items-center"
              >
                {/* Rank */}
                <td className="p-2">
                  <div className="h-4 w-8 bg-gray-800 rounded" />
                </td>

                {/* Avatar */}
                <td className="p-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800 rounded-full" />
                </td>

                {/* Name */}
                <td className="p-2 flex-1">
                  <div className="h-4 sm:h-5 w-32 bg-gray-800 rounded" />
                </td>

                {/* Points */}
                <td className="p-2 ml-auto mr-8 flex items-center">
                  <div className="h-4 sm:h-5 w-12 bg-gray-800 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom gradient overlay */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent z-20 rounded-b-lg" />
    </div>
  );
}
