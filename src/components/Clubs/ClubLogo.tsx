import { IClub } from "@/models/club.schema";
import Image from "next/image";
import React from "react";

interface ClubLogoProps {
  club: IClub;
}

export default function ClubLogo({ club }: ClubLogoProps) {
  return (
    <div className="relative w-30 h-30 mb-4">
      <Image
        src={club.logo}
        alt={`${club.name} logo`}
        fill
        className="object-contain rounded-full border border-gray-300 bg-gray-50"
      />
    </div>
  );
}
