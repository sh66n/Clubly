"use client";

import { Award, Calendar, Goal, LayoutDashboard, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function MobileNavbar() {
  const pathname = usePathname().split("/")[1];

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Events", icon: Calendar, href: "/events" },
    { name: "Awards", icon: Award, href: "/my-points" },
    { name: "Clubs", icon: Users, href: "/clubs" },
    { name: "Leaderboard", icon: Goal, href: "/leaderboard" },
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
            <Icon
              size={28}
              className={`transition-transform duration-200 ${
                isActive ? "text-white scale-125" : "text-[#515151] scale-100"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
