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
      href: user ? `/profiles/${user?.id}` : "/login",
    },
  ];

  return (
    <nav className="bg-black border-t border-[#515151] rounded-t-2xl fixed bottom-0 h-20 w-full md:hidden flex justify-evenly items-center z-50">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href.split("/")[1] ||
          (item.name === "Events" && pathname === "superevents");

        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className="p-3 flex items-center justify-center"
            aria-current={isActive ? "page" : undefined}
          >
            {item.name === "Profile" && user?.image ? (
              // for user image
              <img
                src={user.image}
                alt={user.name}
                className={`h-8 w-8 rounded-full transition-transform duration-200 border ${
                  isActive ? "scale-125" : "scale-100 opacity-60"
                }`}
              />
            ) : (
              <Icon
                size={28}
                className={`transition-transform duration-200 ${
                  isActive ? "text-white scale-125" : "text-[#515151] scale-100"
                }`}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
