"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
  X,
  Menu,
  PanelLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isLoggedIn: boolean;
  points: Number;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

/* ──────────────────────────────────────────────
   Tooltip – portaled to body so it's never clipped
   by overflow on parent containers
   ────────────────────────────────────────────── */
function Tooltip({
  label,
  show,
  children,
}: {
  label: string;
  show: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (hovered && show && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
    }
  }, [hovered, show]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {show &&
        hovered &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{ top: pos.top, left: pos.left, transform: "translateY(-50%)" }}
          >
            <div className="bg-[#222] text-white text-sm font-medium px-3 py-1.5 rounded-lg whitespace-nowrap border border-[#444] shadow-lg">
              {label}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default function Sidebar({ isLoggedIn, points, user }: SidebarProps) {
  const pathname = usePathname().split("/")[1];
  const [isOpen, setIsOpen] = useState(false);
  const [isCompressed, setIsCompressed] = useState(false);

  /* refs for the active-indicator animation */
  const navListRef = useRef<HTMLUListElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCompressed ? "5rem" : "16rem"
    );
  }, [isCompressed]);

  const allNavItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard", section: "nav" },
    { name: "Events", icon: <Calendar size={20} />, href: "/events", section: "nav" },
    { name: "Clubs", icon: <Users size={20} />, href: "/clubs", section: "nav" },
    { name: "Leaderboard", icon: <Goal size={20} />, href: "/leaderboard", section: "nav" },
    { name: "__separator__", icon: null, href: "", section: "separator" },
    { name: "Settings", icon: <Bolt size={20} />, href: "/me", section: "general" },
    { name: "Help", icon: <Info size={20} />, href: "/help", section: "general" },
  ];

  /* helper to check active state */
  const isItemActive = (href: string) => {
    const segment = href.split("/")[1];
    return pathname === segment;
  };

  /* ── Compute position of the active indicator ── */
  const updateIndicator = useCallback(() => {
    if (!navListRef.current) return;
    const activeEl = navListRef.current.querySelector<HTMLElement>(
      "[data-active='true']"
    );
    if (activeEl) {
      const listRect = navListRef.current.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        top: activeRect.top - listRect.top,
        height: activeRect.height,
        opacity: 1,
      });
    } else {
      setIndicatorStyle({ opacity: 0 });
    }
  }, []);

  /* Recalculate whenever the route or compression state changes */
  useEffect(() => {
    updateIndicator();
  }, [pathname, isCompressed, updateIndicator]);

  /* Also recalculate after a small delay on compression toggle
     to let transitions finish */
  useEffect(() => {
    const timer = setTimeout(updateIndicator, 320);
    return () => clearTimeout(timer);
  }, [isCompressed, updateIndicator]);

  return (
    <>
      {/* Mobile menu button */}
      {/* <button
        className="md:hidden absolute top-4 left-4 z-50 p-2 rounded-md bg-black border border-[#515151] text-white"
        onClick={() => setIsOpen(true)}
      >
        <PanelLeft />
      </button> */}

      {/* Sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen ${isCompressed ? "w-20" : "w-64"} p-3 z-50 bg-black text-white transform transition-all duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:fixed md:flex hidden
        `}
      >
        <div className="relative flex flex-col h-full w-full rounded-xl md:border md:border-[#333]">

          {/* Toggle button — sits on the right edge, half in / half out */}
          <button
            onClick={() => setIsCompressed(!isCompressed)}
            className="absolute top-5 -right-3.5 z-10 w-7 h-7 rounded-full border border-[#555] bg-[#1a1a1a] hover:bg-[#333] items-center justify-center transition-colors hidden md:flex"
          >
            {isCompressed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* ===== TOP: Logo (fixed) ===== */}
          <div
            className={`flex items-center shrink-0 border-b border-[#333] rounded-t-xl bg-cover bg-center ${
              isCompressed ? "justify-center px-2 py-5" : "justify-center px-5 py-5"
            }`}
            style={{ backgroundImage: "url('/images/nav-bg.png')" }}
          >
            {isCompressed ? (
              <Link href={"/"} className="flex items-center justify-center">
                <Image
                  src="/images/logo-without-text.png"
                  alt="Clubly Logo"
                  width={32}
                  height={32}
                  priority
                  className="object-contain"
                />
              </Link>
            ) : (
              <Link href={"/"} className="flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Clubly Logo"
                  width={130}
                  height={130}
                  priority
                  placeholder="empty"
                  className="object-contain"
                />
              </Link>
            )}
          </div>

          {/* ===== MIDDLE: Navigation (scrollable) ===== */}
          <div className={`flex-1 overflow-y-auto overflow-x-visible py-6 ${isCompressed ? "px-2" : "px-4"}`}>
            {/* Close button for mobile */}
            <div className="flex justify-end mb-4 md:hidden">
              <button onClick={() => setIsOpen(false)}>
                <X />
              </button>
            </div>

            {/* Navigation section heading */}
            {!isCompressed && (
              <div className="text-[#626262] mb-3 text-xs font-semibold tracking-[0.2em] uppercase">
                Navigation
              </div>
            )}

            {/* All nav items in a single list for the indicator to slide across */}
            <ul ref={navListRef} className="w-full relative">
              {/* Active indicator — full-width gradient background */}
              <div
                className="absolute left-0 right-0 rounded-lg pointer-events-none transition-all duration-300 ease-in-out"
                style={{
                  ...indicatorStyle,
                  background: "linear-gradient(90deg, #000C4A 0%, transparent 100%)",
                }}
              />

              {allNavItems.map((item) => {
                /* Separator between nav and general */
                if (item.section === "separator") {
                  return isCompressed ? (
                    <div key="sep" className="my-4 border-t border-[#333]" />
                  ) : (
                    <div
                      key="sep"
                      className="text-[#626262] mb-3 mt-8 text-xs font-semibold tracking-[0.2em] uppercase"
                    >
                      General
                    </div>
                  );
                }

                const active = isItemActive(item.href);
                return (
                  <li key={item.name} data-active={active}>
                    <Tooltip label={item.name} show={isCompressed}>
                      <Link href={item.href}>
                        <div
                          className={`relative z-[1] flex items-center gap-3 rounded-lg mb-1 transition-colors ${
                            isCompressed
                              ? "justify-center py-3 px-2"
                              : "py-2.5 px-3"
                          } ${
                            active
                              ? "text-white font-semibold"
                              : "text-[#9F9F9F] hover:text-white"
                          }`}
                        >
                          {item.icon}
                          {!isCompressed && <span>{item.name}</span>}
                        </div>
                      </Link>
                    </Tooltip>
                  </li>
                );
              })}

              {/* Logout / Login */}
              {isLoggedIn ? (
                <li>
                  <Tooltip label="Logout" show={isCompressed}>
                    <div
                      className={`relative z-[1] flex items-center gap-3 rounded-lg mb-1 transition-colors text-[#9F9F9F] hover:text-white cursor-pointer ${
                        isCompressed
                          ? "justify-center py-3 px-2"
                          : "py-2.5 px-3"
                      }`}
                    >
                      <LogIn size={20} />
                      {!isCompressed && <LogoutButton />}
                    </div>
                  </Tooltip>
                </li>
              ) : (
                <li>
                  <Tooltip label="Login" show={isCompressed}>
                    <Link href="/login">
                      <div
                        className={`relative z-[1] flex items-center gap-3 rounded-lg mb-1 transition-colors text-[#9F9F9F] hover:text-white ${
                          isCompressed
                            ? "justify-center py-3 px-2"
                            : "py-2.5 px-3"
                        }`}
                      >
                        <LogIn size={20} />
                        {!isCompressed && <span>Login</span>}
                      </div>
                    </Link>
                  </Tooltip>
                </li>
              )}
            </ul>
          </div>

          {/* ===== BOTTOM: Account (fixed) ===== */}
          {isLoggedIn && user && (
            <div
              className={`shrink-0 border-t border-[#333] rounded-b-xl bg-[#171717] ${
                isCompressed ? "py-4 px-2 flex justify-center" : "py-4 px-4"
              }`}
            >
              <Link href="/me" className="flex items-center gap-3">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className={`rounded-full object-cover shrink-0 ${isCompressed ? "w-9 h-9" : "w-10 h-10"}`}
                  />
                ) : (
                  <div
                    className={`rounded-full bg-[#333] flex items-center justify-center text-white font-semibold shrink-0 ${
                      isCompressed ? "w-9 h-9 text-sm" : "w-10 h-10"
                    }`}
                  >
                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                {!isCompressed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-white text-sm font-medium truncate">
                      {user.name || "User"}
                    </span>
                    <span className="text-[#777] text-xs truncate">
                      {user.email || ""}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
