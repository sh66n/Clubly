// src/app/clubs/[clubID]/head/page.tsx

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

// --- Mock Data ---
const clubData = {
  id: "cesa",
  name: "Computer Engineering Student Association",
  category: "Computer Engineering",
  members: 30,
  events: 15,
  founded: 2022,
  description:
    "Building the future through technology and innovation. We focus on developing cutting-edge software solutions and organizing tech events.",
};

const mockFacultyHeads = [
  {
    id: 1,
    name: "Ramesh Kumar",
    role: "CESA Head",
    department: "Computer Engineering Department",
    avatarUrl: "/images/head-james.jpg",
  },
  {
    id: 2,
    name: "Warsin Ahmed",
    role: "Co-Head",
    department: "Computer Engineering Department",
    avatarUrl: "/images/head-linda.jpg",
  },
];

// --- ClubHeader Reused ---
interface ClubHeaderProps {
  clubID: string;
  activeTab: "Events" | "Members" | "Faculty Head";
}

const ClubHeader: React.FC<ClubHeaderProps> = ({ clubID, activeTab }) => {
  const club = clubData;
  const tabs = [
    { name: "Events", href: `/clubs/${clubID}`, tabKey: "Events" },
    { name: "Members", href: `/clubs/${clubID}/members`, tabKey: "Members" },
    {
      name: "Faculty Head",
      href: `/clubs/${clubID}/head`,
      tabKey: "Faculty Head",
    },
  ] as const;

  return (
    <div className="mb-8">
      {/* Logo + Name */}
      <div className="flex items-center space-x-6 px-6 py-4 -mt-4">
        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border border-gray-600">
          <Image
            src="/images/club-logo.png"
            alt="Club Logo"
            width={96}
            height={96}
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{club.name}</h1>
          <p className="text-blue-400 font-semibold">{club.category}</p>
          <div className="flex space-x-4 text-sm text-gray-300 mt-1">
            <span>{club.members} Members</span>
            <span>{club.events} Events</span>
            <span>Founded {club.founded}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-600">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <Link key={tab.name} href={tab.href}>
              <div
                className={`py-3 px-1 font-medium text-sm cursor-pointer transition ${
                  tab.tabKey === activeTab
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {tab.name}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Description */}
      <p className="text-gray-200 px-6 py-4 max-w-4xl text-sm">
        {club.description}
      </p>
    </div>
  );
};

// --- Faculty Card ---
const FacultyCard = ({
  faculty,
}: {
  faculty: (typeof mockFacultyHeads)[0];
}) => (
  <div className="flex flex-col items-center bg-black/40 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700 text-center w-full">
    <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-gray-700">
      <Image
        src={faculty.avatarUrl}
        alt={faculty.name}
        width={128}
        height={128}
        className="object-cover"
      />
    </div>
    <h3 className="text-xl font-bold text-white mb-1">{faculty.name}</h3>
    <p className="text-blue-400 font-semibold mb-2">{faculty.role}</p>
    <p className="text-sm text-gray-400">{faculty.department}</p>
  </div>
);

// --- Main Faculty Head Page ---
export default function ClubHeadPage({
  params,
}: {
  params: { clubID: string };
}) {
  const { clubID } = params;

  return (
    <div className="min-h-screen text-white">
      <ClubHeader clubID={clubID} activeTab="Faculty Head" />

      <div className="max-w-7xl mx-auto px-6 pb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Faculty Heads</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockFacultyHeads.map((head) => (
            <FacultyCard key={head.id} faculty={head} />
          ))}
        </div>
      </div>
    </div>
  );
}
