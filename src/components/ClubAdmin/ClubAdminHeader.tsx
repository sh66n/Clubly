"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, Bell, Settings, Calendar, CreditCard, MessageSquare, Menu } from "lucide-react";

interface NotificationFeedItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "registration" | "payment" | "feedback";
}

interface ClubAdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  onMenuClick?: () => void;
}

const pageTitles: Record<string, string> = {
  "/club-admin/dashboard": "Dashboard",
  "/club-admin/events": "Events",
  "/club-admin/club": "My Club",
};

export default function ClubAdminHeader({ user, onMenuClick }: ClubAdminHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const title = pageTitles[pathname] || "Dashboard";

  // Read active academicYear from search parameters or fallback to today's active cycle
  const getActiveAcademicYear = () => {
    const fromUrl = searchParams.get("academicYear");
    if (fromUrl) return fromUrl;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // July is 6
    return currentMonth >= 6 
      ? `${currentYear}-${currentYear + 1}` 
      : `${currentYear - 1}-${currentYear}`;
  };

  const academicYear = getActiveAcademicYear();

  const [notifications, setNotifications] = useState<NotificationFeedItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    fetch(`/api/club-admin/notifications?academicYear=${academicYear}`)
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 45 seconds for active updates
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [academicYear]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "registration":
        return <Calendar size={12} className="text-blue-500" />;
      case "payment":
        return <CreditCard size={12} className="text-emerald-500" />;
      case "feedback":
        return <MessageSquare size={12} className="text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white px-4 md:px-6 py-3 border-b border-[#e0e0e0]">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-[#222]">{title}</h1>
        </div>

        {/* Right: Search, icons, profile */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden sm:flex items-center bg-white border border-[#e0e0e0] rounded-lg px-3 py-2 gap-2 w-56 lg:w-72">
            <Search size={18} className="text-[#999]" />
            <input
              type="text"
              placeholder="Search here…"
              className="bg-transparent text-sm text-[#333] placeholder:text-[#999] outline-none flex-1"
            />
          </div>

          {/* Notification bell and dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#e0e0e0] bg-white hover:bg-gray-50 transition-colors relative outline-none"
            >
              <Bell size={18} className="text-[#555]" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#7CB342] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 z-40 bg-white border border-slate-200 shadow-xl rounded-xl w-72 py-3 animate-in fade-in duration-100">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700">
                    Notifications Feed
                  </span>
                  <button 
                    onClick={() => setNotifications([])} 
                    className="text-[9px] text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto px-1 py-1 divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-6 px-4">
                      No recent updates. Live registrations, payments, and reviews will appear here.
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="flex items-start gap-2.5 px-3.5 py-2.5 hover:bg-slate-50/50 transition-colors">
                        <div className="w-5 h-5 rounded bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                          {getIcon(notif.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-slate-700 font-semibold leading-normal break-words">
                            {notif.message}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-medium">
                            {getRelativeTime(notif.time)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="w-9 h-9 flex items-center justify-center rounded-full border border-[#e0e0e0] bg-white hover:bg-gray-50 transition-colors">
            <Settings size={18} className="text-[#555]" />
          </button>

          {/* User profile pill */}
          <div className="flex items-center gap-2 pl-3 border-l border-[#e0e0e0]">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#e0e0e0] flex items-center justify-center text-sm font-semibold text-[#555]">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-semibold text-[#222] leading-tight">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] font-medium text-[#7CB342] uppercase tracking-wide bg-[#f0f7e6] px-1.5 py-0.5 rounded-sm w-fit leading-tight">
                Club Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
