"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

// --- Mock Club Data ---
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

// --- Mock Events Data ---
const clubEvents = [
  {
    title: "KAUN BANEGA CODER",
    status: "UPCOMING",
    imageUrl: "/images/event1.jpg",
  },
  {
    title: "CoDeZia",
    status: "COMPLETED",
    imageUrl: "/images/event2.jpg",
  },
  {
    title: "Technetics",
    status: "COMPLETED",
    imageUrl: "/images/event3.jpg",
  },
];

// --- Club Header Component ---
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
    <div className="mb-6">
      {/* Logo + Name Section */}
      <div className="flex items-center space-x-6 px-6 py-4 -mt-4">
        {/* Replace this with actual logo */}
        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border border-gray-600">
          <Image
            src="/images/club-logo.png"
            alt="Club Logo"
            width={96}
            height={96}
            className="object-cover"
          />
        </div>

        {/* Club Details */}
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

// --- Event Card Component ---
interface EventCardProps {
  event: (typeof clubEvents)[0];
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const statusColor =
    event.status === "UPCOMING" ? "bg-yellow-500 text-black" : "bg-green-500 text-white";

  return (
    <div className="relative bg-black/40 backdrop-blur-md rounded-lg overflow-hidden shadow-lg border border-gray-700 transition-transform hover:scale-[1.02]">
      <Image
        src={event.imageUrl}
        alt={event.title}
        width={300}
        height={200}
        className="w-full h-36 object-cover"
      />
      <span
        className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded ${statusColor}`}
      >
        {event.status}
      </span>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">{event.title}</h3>
        <p className="text-sm text-gray-300 mt-1">29 September 2025 .</p>
      </div>
    </div>
  );
};

// --- Main Events Page ---
export default function ClubEventsPage({ params }: { params: { clubID: string } }) {
  const { clubID } = params;

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <ClubHeader clubID={clubID} activeTab="Events" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Club Events</h2>
          <span className="text-gray-300">{clubEvents.length} total events</span>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubEvents.map((event, index) => (
            <EventCard key={index} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}
