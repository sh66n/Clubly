"use client";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import {
  Bolt,
  Calendar,
  Goal,
  Info,
  LayoutDashboard,
  LogIn,
  Power,
  Users,
} from "lucide-react";

export default function Sidebar({ points }) {
  const pathname = usePathname().split("/")[1];

  return (
    <div className="fixed top-0 left-0 h-screen w-64 p-4 overflow-y-auto">
      <div className="flex flex-col h-full rounded-lg border border-[#515151] p-4">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/images/logo.png"
            alt="Clubly Logo"
            width={160}
            height={160}
            priority
            placeholder="empty"
            className="object-contain"
          />
        </div>

        {/* Menu */}
        <div className="flex-1">
          <div className="heading text-[#626262] mb-2 text-xl">Menu</div>
          <ul>
            {[
              {
                name: "Dashboard",
                icon: <LayoutDashboard />,
                href: "/dashboard",
              },
              { name: "Events", icon: <Calendar />, href: "/events" },
              { name: "Clubs", icon: <Users />, href: "/clubs" },
              { name: "Leaderboard", icon: <Goal />, href: "/leaderboard" },
            ].map((item) => (
              <li
                key={item.name}
                className={`mb-2 ${
                  pathname.includes(item.href.split("/")[1])
                    ? "text-white font-semibold"
                    : "text-[#9F9F9F]"
                }`}
              >
                <Link href={item.href}>
                  <div className="flex gap-4 items-center hover:text-white cursor-pointer">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* General */}
          <div className="heading text-[#626262] mb-2 mt-6 text-xl">
            General
          </div>
          <ul>
            <li className="mb-2 flex items-center gap-4 text-[#9F9F9F] hover:text-white cursor-pointer">
              <Bolt />
              Settings
            </li>
            <li className="mb-2 flex items-center gap-4 text-[#9F9F9F] hover:text-white cursor-pointer">
              <Info />
              Help
            </li>
            {points != null ? (
              <li className="mb-2 flex items-center gap-4 text-[#9F9F9F] hover:text-white cursor-pointer">
                <Power />
                <LogoutButton />
              </li>
            ) : (
              <li className="mb-2">
                <Link
                  href="/login"
                  className="flex items-center gap-4 text-[#9F9F9F] hover:text-white"
                >
                  <LogIn />
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* My Points */}
        {points != null && (
          <div className="mt-4 flex-shrink-0 w-full">
            <div className="w-full relative pb-[100%] bg-[url('/images/myPoints.png')] bg-cover bg-center rounded-md">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-sm md:text-xl lg:text-2xl">
                  My Points
                </span>
                <div className="mt-4 text-lg md:text-4xl lg:text-6xl font-semibold">
                  {points}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
