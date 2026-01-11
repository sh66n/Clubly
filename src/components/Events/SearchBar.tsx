"use client";

import { getColorFromString } from "@/lib/utils";
import { IClub } from "@/models/club.schema";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface SearchBarProps {
  clubs: IClub[];
}

export default function SearchBar({ clubs }: SearchBarProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const selectedClub = searchParams.get("club") || "";

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Search Form */}
      <form className="flex gap-2" method="GET">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search events..."
          className="bg-[#191919] rounded-full px-4 w-full md:w-1/2 text-white"
        />
        {/* Keep currently selected club when searching */}
        {selectedClub && (
          <input type="hidden" name="club" value={selectedClub} />
        )}
        <button type="submit" className="bg-black p-2 rounded-full text-white">
          <Search />
        </button>
      </form>

      {/* Club Filter Form */}
      <form className="flex flex-wrap gap-2" method="GET">
        {/* Keep current search query when filtering by club */}
        {query && <input type="hidden" name="q" value={query} />}
        {clubs.map((club) => {
          const isSelected = selectedClub === club._id.toString();

          return (
            <button
              key={club._id}
              type="submit"
              name="club"
              value={isSelected ? "" : club._id.toString()} // reset if already selected
              className={`hover:cursor-pointer px-4 py-1.5 rounded-full transition-all ${
                isSelected
                  ? "bg-white text-black border border-black"
                  : "bg-black text-white border border-gray-800 hover:bg-white hover:text-black"
              }`}
            >
              {club.name}
            </button>
          );
        })}
      </form>
    </div>
  );
}
