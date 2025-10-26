import { Award } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Table({ topUsers }) {
  return (
    <div className="bg-black h-[40%] flex flex-col rounded-lg border border-[#515151] relative z-10">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-b-[#515151] text-lg sm:text-2xl font-semibold">
        All Time
      </div>

      {/* Table body with scroll */}
      <div className="overflow-y-auto flex-1 scrollbar-hide">
        <table className="w-full">
          <tbody>
            {topUsers.map((user, index) => (
              <tr
                key={user._id}
                className="border-b border-[#515151] flex items-center"
              >
                <td className="p-2 text-sm sm:text-base">#{index + 1}</td>
                <td className="p-2">
                  <Link href={`/profiles/${user._id}`}>
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                    />
                  </Link>
                </td>
                <td className="p-2 text-sm sm:text-base">{user.name}</td>
                <td className="p-2 font-semibold ml-auto mr-8 flex items-center text-sm sm:text-base">
                  {user.points}
                  <Award className="ml-1 w-4 h-4" />
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
