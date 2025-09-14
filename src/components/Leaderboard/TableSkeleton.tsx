import React from "react";

export default function TableSkeleton() {
  return (
    <div className="bg-black h-[40%] flex flex-col rounded-lg border border-[#515151] animate-pulse">
      {/* Header */}
      <div className="p-4 border-b border-b-[#515151] text-2xl font-semibold">
        <div className="h-6 w-24 bg-gray-800 rounded" />
      </div>

      {/* Rows */}
      <div className="overflow-y-auto scrollbar-hide">
        <table className="bg-black w-full">
          <tbody>
            {[...Array(6)].map((_, i) => (
              <tr
                key={i}
                className="border-b border-[#515151] flex items-center"
              >
                <td className="p-2 w-10">
                  <div className="h-4 w-6 bg-gray-800 rounded" />
                </td>
                <td className="p-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800" />
                </td>
                <td className="p-2 flex-1">
                  <div className="h-4 w-32 bg-gray-800 rounded" />
                </td>
                <td className="p-2 ml-auto mr-20 flex items-center gap-1">
                  <div className="h-4 w-10 bg-gray-800 rounded" />
                  <div className="h-4 w-4 bg-gray-800 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gradient Fade Bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent z-20 rounded-b-lg" />
    </div>
  );
}
