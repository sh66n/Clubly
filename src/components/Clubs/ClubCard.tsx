"use client";

import { IClub } from "@/models/club.schema";
import Image from "next/image";
import Link from "next/link";

interface ClubCardProps {
  club: IClub;
}

export default function ClubCard({ club }: ClubCardProps) {
  return (
    <Link
      href={`/clubs/${club._id}`}
      className="rounded-2xl border border-[#515151] bg-black shadow-sm hover:shadow-md transition p-6 text-center flex flex-col"
    >
      {/* Logo */}
      <div className="relative w-20 h-20 mx-auto mb-4">
        <Image
          src={club.logo}
          alt={`${club.name} logo`}
          fill
          className="object-contain rounded-full border border-gray-300 bg-gray-50"
        />
      </div>

      {/* Club Info */}
      <h2 className="text-lg font-semibold">{club.name}</h2>
      <p className="text-sm text-gray-500">{club.department}</p>

      {/* Stats */}
      <div className="grow flex justify-center items-end gap-4 mt-4 text-xs text-gray-600">
        <span>{club.events?.length || 0} Events</span>
        <span>{club.coreMembers?.length || 0} Core</span>
        <span>{club.volunteers?.length || 0} Vols</span>
      </div>
    </Link>
  );
}
