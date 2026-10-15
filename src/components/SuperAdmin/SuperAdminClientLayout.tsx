"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Building2,
  Activity,
  Settings,
  Bell,
  Search,
  Mic,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SuperAdminClientLayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function SuperAdminClientLayout({
  children,
  user,
}: SuperAdminClientLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard, exact: true },
    { name: "Leadership", href: "/super-admin/admins", icon: Users, exact: false },
    { name: "Clubs", href: "/super-admin/clubs", icon: Building2, exact: false },
    { name: "Live Feed", href: "/super-admin/activity", icon: Activity, exact: false },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    /* Full viewport: No outer padding, no inner card framing, fills 100% of the browser */
    <div className="h-screen w-screen bg-[#16161a] text-[#e2e2ea] flex overflow-hidden font-sans antialiased selection:bg-[#9d6381]/30 selection:text-white">
      
      {/* Left Sidebar - Full vertical height */}
      <aside className="w-[220px] shrink-0 bg-[#131217] border-r border-[#22212a] flex flex-col justify-between p-5 select-none">
        <div className="space-y-8">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 px-1 pt-1">
            <div className="h-7 w-7 rounded-full border-[1.5px] border-[#a0748b] flex items-center justify-center relative">
              <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-tr from-[#9c5a7f] to-[#be8da7]" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-[#f2f2f7]">
              Clubly Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[16px] text-[13px] font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#6e465c] via-[#523747] to-[#3a2833] text-[#ffffff] shadow-[0_4px_16px_rgba(110,70,92,0.3)] border border-[#855570]/40"
                      : "text-[#888796] hover:text-[#e0dfec] hover:bg-[#1c1b22]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-[#f1d5e3]" : "text-[#767584]"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Navigation / Actions */}
        <div className="space-y-1 pt-4 border-t border-[#1f1e26]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-[14px] text-[12.5px] text-[#888796] hover:text-white hover:bg-[#1c1b22] transition-colors"
          >
            <Settings className="h-4 w-4 text-[#767584]" />
            <span>Campus View</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-[14px] text-[12.5px] text-[#888796] hover:text-[#ff9bb0] hover:bg-[#251b22] transition-colors"
          >
            <LogOut className="h-4 w-4 text-[#767584]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Screen Body - Full width and height */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#16161a] overflow-hidden">
        
        {/* Top Header */}
        <header className="px-8 pt-6 pb-4 flex items-center justify-between gap-4 shrink-0 border-b border-[#201f27]">
          <div>
            <h1 className="text-[22px] font-semibold text-[#f5f5fa] tracking-tight">
              Welcome, {user?.name?.split(" ")[0] || "Admin"}
            </h1>
            <p className="text-[12px] text-[#797887]">
              Here's your campus administration and club overview
            </p>
          </div>

          {/* Top Controls: Search pill + Notification/Settings + Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5 bg-[#1f1e26] border border-[#2d2c38] rounded-full px-3.5 py-1.5 text-[#8b8a99] w-64 hover:border-[#42404e] transition-colors">
              <Search className="h-3.5 w-3.5 text-[#737280]" />
              <input
                type="text"
                placeholder="Ask college AI anything"
                className="bg-transparent text-xs text-[#dedde8] placeholder:text-[#6a6977] outline-none w-full"
              />
              <Mic className="h-3.5 w-3.5 text-[#737280]" />
            </div>

            <div className="flex items-center gap-1.5">
              <button className="h-9 w-9 rounded-full bg-[#1f1e26] border border-[#2d2c38] flex items-center justify-center text-[#8e8d9c] hover:text-white transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              <button className="h-9 w-9 rounded-full bg-[#1f1e26] border border-[#2d2c38] flex items-center justify-center text-[#8e8d9c] hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 pl-2">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover border border-[#3b3a48]"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#6e465c] to-[#9c5a7f] flex items-center justify-center text-white text-xs font-semibold">
                  {user?.name?.[0] || "A"}
                </div>
              )}
              <div className="hidden xl:block text-left">
                <p className="text-[12.5px] font-semibold text-[#f0eff8] leading-tight">
                  {user?.name || "College Administrator"}
                </p>
                <p className="text-[10.5px] text-[#717080] leading-tight">
                  {user?.email || "admin@pvppcoe.ac.in"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport Content Area */}
        <main className="flex-1 px-8 py-5 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>

    </div>
  );
}
