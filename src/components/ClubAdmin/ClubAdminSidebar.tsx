"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  Tickets,
  UsersRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ClubAdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export default function ClubAdminSidebar({ user }: ClubAdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--club-admin-sidebar-width",
      isCollapsed ? "5rem" : "17rem",
    );
  }, [isCollapsed]);

  const navItems = [
    {
      name: "Dashboard",
      icon: <LayoutGrid size={20} />,
      href: "/club-admin/dashboard",
    },
    {
      name: "My Events",
      icon: <Tickets size={20} />,
      href: "/club-admin/events",
    },
    {
      name: "My Club",
      icon: <UsersRound size={20} />,
      href: "/club-admin/club",
    },
  ];

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen ${isCollapsed ? "w-20" : "w-[17rem]"} z-50 transition-all duration-300 hidden md:flex flex-col`}
      style={{ background: "#091800" }}
    >
      {/* Collapse toggle — green circle on the right edge */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-7 -right-3.5 z-10 w-7 h-7 rounded-full bg-[#7CB342] hover:bg-[#689F38] flex items-center justify-center transition-colors shadow-md"
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="text-white" />
        ) : (
          <ChevronLeft size={14} className="text-white" />
        )}
      </button>

      {/* ── Logo ── */}
      <div
        className={`shrink-0 ${isCollapsed ? "px-3 py-6 flex justify-center" : "px-5 py-6"}`}
      >
        <Link
          href="/club-admin/dashboard"
          className="flex items-center gap-2.5"
        >
          {isCollapsed ? (
            <Image
              src="/images/logo-without-text-club-admin.png"
              alt="Clubly"
              width={36}
              height={36}
              priority
              className="object-contain"
            />
          ) : (
            <Image
              src="/images/logo-club-admin.png"
              alt="Clubly"
              width={140}
              height={40}
              priority
              placeholder="empty"
              className="object-contain"
            />
          )}
        </Link>
      </div>

      {/* ── PRIMARY section ── */}
      <div className={`flex-1 ${isCollapsed ? "px-2" : "px-4"}`}>
        {!isCollapsed && (
          <div className="text-[#8a9a6c] text-[11px] font-bold tracking-[0.15em] uppercase mb-3">
            Primary
          </div>
        )}

        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const active = isItemActive(item.href);
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center gap-3 rounded-xl transition-all duration-200 ${
                      isCollapsed
                        ? "justify-center py-3 px-2"
                        : "py-3 px-4"
                    } ${
                      active
                        ? "text-[#1a2e00] font-semibold"
                        : "text-[#c5d6a8] hover:text-white hover:bg-white/5"
                    }`}
                    style={
                      active
                        ? {
                            background:
                              "linear-gradient(90deg, #7CB342 0%, #9CCC65 100%)",
                          }
                        : undefined
                    }
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <span className="text-sm">{item.name}</span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── GENERAL section ── */}
        <div className="mt-10">
          {!isCollapsed ? (
            <div className="text-[#8a9a6c] text-[11px] font-bold tracking-[0.15em] uppercase">
              General
            </div>
          ) : (
            <div className="border-t border-[#2a3a10]" />
          )}
        </div>
      </div>
    </div>
  );
}
