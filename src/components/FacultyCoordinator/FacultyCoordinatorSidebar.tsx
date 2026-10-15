"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  FileCheck2,
  FileSpreadsheet,
  Trophy,
  Bell,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";

export type FacultyTabKey =
  | "overview"
  | "attendance"
  | "naac"
  | "leaderboard"
  | "notifications";

interface FacultyCoordinatorSidebarProps {
  user?: any;
  activeTab: FacultyTabKey;
  onSelectTab: (tab: FacultyTabKey) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function FacultyCoordinatorSidebar({
  user,
  activeTab,
  onSelectTab,
  mobileOpen = false,
  onMobileClose,
}: FacultyCoordinatorSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { name: tenantName } = useTenant();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("clubly_faculty_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("clubly_faculty_sidebar_collapsed", String(isCollapsed));
    } catch {
      // ignore
    }
    document.documentElement.style.setProperty(
      "--faculty-sidebar-width",
      isCollapsed ? "5rem" : "17rem"
    );
  }, [isCollapsed]);

  const navItems: { key: FacultyTabKey; name: string; icon: React.ReactNode }[] = [
    {
      key: "overview",
      name: "Club Overview",
      icon: <LayoutGrid size={19} />,
    },
    {
      key: "attendance",
      name: "Attendance Reports",
      icon: <FileSpreadsheet size={19} />,
    },
    {
      key: "naac",
      name: "NAAC Audit Report",
      icon: <FileCheck2 size={19} />,
    },
    {
      key: "leaderboard",
      name: "Student Performance",
      icon: <Trophy size={19} />,
    },
    {
      key: "notifications",
      name: "Activity Stream",
      icon: <Bell size={19} />,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 flex flex-col ${
          isCollapsed ? "md:w-20" : "md:w-68"
        } ${
          mobileOpen ? "translate-x-0 w-68" : "-translate-x-full md:translate-x-0"
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

        {/* Desktop Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute top-7 -right-3.5 z-10 w-7 h-7 rounded-full bg-[#7CB342] hover:bg-[#689F38] items-center justify-center transition-colors shadow-md cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={14} className="text-white" />
          ) : (
            <ChevronLeft size={14} className="text-white" />
          )}
        </button>

        {/* Logo Banner */}
        <div
          className={`shrink-0 border-b border-[#2a3a10] relative overflow-hidden ${
            isCollapsed ? "px-2 py-5 flex justify-center" : "px-5 py-5 flex justify-center"
          }`}
          style={{
            background:
              "radial-gradient(circle 95px at 0% 0%, rgba(220, 252, 162, 0.3) 0%, transparent 100%), #0d2800",
          }}
        >
          <Link
            href="/faculty-coordinator/dashboard"
            onClick={() => {
              onSelectTab("overview");
              if (onMobileClose) onMobileClose();
            }}
            className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/images/svg-logo.svg"
              alt="Clubly"
              width={isCollapsed ? 34 : 38}
              height={isCollapsed ? 30 : 34}
              priority
              className="object-contain"
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-black font-jakarta tracking-wide text-white">
                  Clubly
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#9CCC65] font-bold max-w-[140px] truncate">
                  {tenantName || "Faculty Portal"}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation list */}
        <div className={`flex-1 mt-6 ${isCollapsed ? "md:px-2 px-3" : "px-3"}`}>
          {!isCollapsed && (
            <div className="text-[#8a9a6c] text-[10px] font-bold tracking-[0.15em] uppercase mb-3 px-3">
              Compliance & Reports
            </div>
          )}

          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const active = activeTab === item.key;
              return (
                <li key={item.key}>
                  <button
                    onClick={() => {
                      onSelectTab(item.key);
                      if (onMobileClose) onMobileClose();
                      if (pathname !== "/faculty-coordinator/dashboard") {
                        router.push("/faculty-coordinator/dashboard");
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 cursor-pointer ${
                      isCollapsed
                        ? "md:justify-center md:py-3 md:px-2 py-3 px-4"
                        : "py-2.5 px-3.5"
                    } ${
                      active
                        ? "text-[#1a2e00] font-bold shadow-md"
                        : "text-[#c5d6a8] hover:text-white hover:bg-white/5 font-medium"
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
                    <span className="shrink-0">{item.icon}</span>
                    <span className={isCollapsed ? "md:hidden text-xs" : "text-xs"}>
                      {item.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Read-only banner footer */}
        <div className="p-4 border-t border-[#2a3a10]">
          {!isCollapsed ? (
            <div className="bg-white/5 border border-[#2a3a10] rounded-xl p-3 text-[11px] text-[#c5d6a8] flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#7CB342] shrink-0" />
              <span>Read-only compliance mode active</span>
            </div>
          ) : (
            <div className="flex justify-center" title="Read-only compliance mode active">
              <ShieldCheck size={18} className="text-[#7CB342]" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
