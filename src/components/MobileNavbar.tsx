"use client";

import {
  Calendar,
  CircleUser,
  Goal,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User } from "next-auth";

interface MobileNavbarProps {
  user?: User;
}

export default function MobileNavbar({ user }: MobileNavbarProps) {
  const pathname = usePathname().split("/")[1];

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Events", icon: Calendar, href: "/events" },
    { name: "Clubs", icon: Users, href: "/clubs" },
    { name: "Leaderboard", icon: Goal, href: "/leaderboard" },
    {
      name: "Profile",
      icon: CircleUser,
      href: user ? `/me` : "/login",
    },
  ];

  return (
    <nav className="bg-black/95 backdrop-blur-md border-t border-x border-[#333] rounded-t-3xl shadow-2xl fixed bottom-0 h-16 w-full md:hidden flex justify-around items-center z-50 px-3">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href.split("/")[1] ||
          (item.name === "Events" && (pathname === "superevents" || pathname === "hackathons"));

        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-200 ${
              isActive ? "text-white" : "text-[#777] hover:text-[#aaa]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {item.name === "Profile" && user?.image ? (
              <img
                src={user.image}
                alt={user.name || "Profile"}
                className={`h-6 w-6 rounded-full transition-transform duration-200 border ${
                  isActive ? "border-white scale-110" : "border-transparent opacity-70"
                }`}
              />
            ) : (
              <Icon
                size={20}
                className={`transition-transform duration-200 ${
                  isActive ? "text-white scale-110" : "text-[#777]"
                }`}
              />
            )}
            <span
              className={`text-[10px] tracking-tight leading-none ${
                isActive ? "font-bold text-white" : "font-medium text-[#777]"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
