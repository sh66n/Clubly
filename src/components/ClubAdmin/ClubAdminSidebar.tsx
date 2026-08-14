"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  Tickets,
  Award,
  UsersRound,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
} from "lucide-react";

interface ClubAdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function ClubAdminSidebar({
  user,
  mobileOpen = false,
  onMobileClose,
}: ClubAdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--club-admin-sidebar-width",
      isCollapsed ? "5rem" : "17rem"
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
      name: "Certificates",
      icon: <Award size={20} />, 
      href: "/club-admin/certificates",
    },
    {
      name: "My Club",
      icon: <UsersRound size={20} />,
      href: "/club-admin/club",
    },
    {
      name: "Feedback Forms",
      icon: <MessageSquare size={20} />,
      href: "/club-admin/feedback-forms",
    },
  ];

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 flex flex-col ${
          /* Desktop behavior */
          isCollapsed ? "md:w-20" : "md:w-[17rem]"
        } ${
          /* Mobile behavior */
          mobileOpen ? "translate-x-0 w-[17rem]" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ background: "#091800" }}
      >
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="md:hidden absolute top-5 right-4 z-10 text-white/70 hover:text-white p-1"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* Desktop Collapse toggle — green circle on the right edge */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute top-7 -right-3.5 z-10 w-7 h-7 rounded-full bg-[#7CB342] hover:bg-[#689F38] items-center justify-center transition-colors shadow-md"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={14} className="text-white" />
          ) : (
            <ChevronLeft size={14} className="text-white" />
          )}
        </button>

        {/* ── Logo ── */}
        <div
          className={`shrink-0 border-b border-[#2a3a10] relative overflow-hidden ${
            isCollapsed ? "px-2 py-5 flex justify-center" : "px-5 py-5 flex justify-center"
          }`}
          style={{
            background: `
              radial-gradient(circle 95px at 0% 0%, rgba(220, 252, 162, 0.4) 0%, transparent 100%),
              radial-gradient(circle 118px at 100% 100%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 50%, transparent 100%),
              #0d2800
            `
          }}
        >
          {/* Grainy Noise Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />
          <Link
            href="/club-admin/dashboard"
            onClick={() => onMobileClose && onMobileClose()}
            className="flex items-center justify-center gap-2"
          >
            {isCollapsed ? (
              <>
                <Image
                  src="/images/svg-logo.svg"
                  alt="Clubly"
                  width={36}
                  height={31}
                  priority
                  className="hidden md:block object-contain"
                />
                <Image
                  src="/images/svg-logo.svg"
                  alt="Clubly"
                  width={36}
                  height={31}
                  priority
                  className="md:hidden object-contain"
                />
              </>
            ) : (
              <>
                <Image
                  src="/images/svg-logo.svg"
                  alt="Clubly"
                  width={42}
                  height={36}
                  priority
                  className="object-contain"
                />
                <span className="text-2xl font-extrabold font-jakarta tracking-wide text-white">Clubly</span>
              </>
            )}
          </Link>
        </div>

        {/* ── PRIMARY section ── */}
        <div className={`flex-1 mt-6 ${isCollapsed ? "md:px-2 px-4" : "px-4"}`}>
          <div
            className={`text-[#8a9a6c] text-[11px] font-bold tracking-[0.15em] uppercase mb-3 ${
              isCollapsed ? "hidden md:hidden" : "block"
            }`}
          >
            Primary
          </div>

          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => onMobileClose && onMobileClose()}
                  >
                    <div
                      className={`flex items-center gap-3 rounded-xl transition-all duration-200 ${
                        isCollapsed
                          ? "md:justify-center md:py-3 md:px-2 py-3 px-4"
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
                      <span className={isCollapsed ? "md:hidden text-sm" : "text-sm"}>
                        {item.name}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ── GENERAL section ── */}
          <div className="mt-10">
            <div
              className={`text-[#8a9a6c] text-[11px] font-bold tracking-[0.15em] uppercase ${
                isCollapsed ? "hidden md:hidden" : "block"
              }`}
            >
              General
            </div>
            {isCollapsed && <div className="hidden md:block border-t border-[#2a3a10]" />}
          </div>
        </div>
      </aside>
    </>
  );
}

