// src/app/clubs/[clubID]/members/page.tsx

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

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

const mockClubMembers = [
  { id: 1, name: "Sakshi Patil", role: "President", year: "3rd Year", department: "Computer Engineering", avatarUrl: "/images/Sakshi-Patil.jpg" },
  { id: 2, name: "Manish Parmar", role: "Vice President", year: "3rd Year", department: "Computer Engineering", avatarUrl: "/images/Manish-Parmar.jpg" },
  { id: 3, name: "Siddarth Tiwari", role: "Technical Head", year: "3rd Year", department: "Computer Engineering", avatarUrl: "/images/Siddarth-Tiwari.jpg" },
  { id: 4, name: "Suchit Bangar", role: "Event Coordinator", year: "3rd Year", department: "Computer Engineering", avatarUrl: "/images/Suchit-Bangar.jpg" },
  { id: 5, name: "Shubham Kumbhar", role: "Treasurer", year: "3rd Year", department: "Computer Engineering", avatarUrl: "/images/Shubham-Kumbhar.jpg" },
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
    { name: "Faculty Head", href: `/clubs/${clubID}/head`, tabKey: "Faculty Head" },
  ] as const;

  return (
    <div className="mb-8">
      {/* Logo + Name */}
      <div className="flex items-center space-x-6 px-6 py-4 -mt-4">
        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border border-gray-600">
          <Image src="/images/club-logo.png" alt="Club Logo" width={96} height={96} className="object-cover" />
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
      <p className="text-gray-200 px-6 py-4 max-w-4xl text-sm">{club.description}</p>
    </div>
  );
};

// --- Member Card ---
const MemberCard = ({ member }: { member: (typeof mockClubMembers)[0] }) => (
  <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
        <Image src={member.avatarUrl} alt={member.name} width={48} height={48} className="object-cover" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">{member.name}</h3>
        <p className="text-blue-400 font-semibold text-sm">{member.role}</p>
      </div>
    </div>
    <p className="text-sm text-gray-400 mb-4">
      {member.year} • {member.department}
    </p>
    <div className="flex space-x-4 border-t border-gray-700 pt-4">
      <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition">
        <Mail className="w-4 h-4" />
        <span className="text-sm">Email</span>
      </button>
      <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition">
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm">Message</span>
      </button>
    </div>
  </div>
);

// --- Main Members Page ---
export default function ClubMembersPage({ params }: { params: { clubID: string } }) {
  const { clubID } = params;

  return (
    <div className="min-h-screen text-white">
      <ClubHeader clubID={clubID} activeTab="Members" />

      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Club Members</h2>
          <span className="text-gray-300">{mockClubMembers.length} total members</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockClubMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
}
