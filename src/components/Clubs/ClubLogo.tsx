import { IClub } from "@/models/club.schema";
import Image from "next/image";
import React from "react";

interface ClubLogoProps {
  club: IClub;
}

export default function ClubLogo({ club }: ClubLogoProps) {
  return (
    <div className="relative w-20 h-20 sm:w-28 sm:h-28 -mt-10 sm:-mt-14 ml-2 sm:ml-4 mb-4">
      <Image
        src={club.logo}
        alt={`${club.name} logo`}
        fill
        className="object-contain rounded-full border-2 border-gray-300 bg-gray-50 shadow-md"
      />
    </div>
  );
}
