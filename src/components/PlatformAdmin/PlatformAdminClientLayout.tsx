"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  LogOut,
  Globe,
  ExternalLink,
  ChevronRight,
  Database,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface PlatformAdminClientLayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function PlatformAdminClientLayout({
  children,
  user,
}: PlatformAdminClientLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Overview",
      href: "/platform-admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Colleges & Tenants",
      href: "/platform-admin/tenants",
      icon: Building2,
      exact: false,
    },
    {
      name: "Platform Users",
      href: "/platform-admin/users",
      icon: Users,
      exact: false,
    },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="h-screen w-screen bg-[#0d0f12] text-zinc-200 flex overflow-hidden font-sans antialiased selection:bg-indigo-500/30 selection:text-white">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#111419] border-r border-zinc-800/80 flex flex-col justify-between p-5 transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-7">
          {/* Platform Console Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  Clubly
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    SaaS
                  </span>
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">Platform Console</span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 px-3 pb-2 block">
              Core Management
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-white" : "text-zinc-400"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Multi-Tenant System Status Pill */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> Isolation Engine
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-zinc-500 leading-snug">
              AsyncLocalStorage TenantPlugin active across all collections.
            </p>
          </div>
        </div>

        {/* Footer: User profile and logout */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-3 px-1">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "Admin"}
                className="w-9 h-9 rounded-full object-cover border border-zinc-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.[0] || "A"}
              </div>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">
                {user?.name || "Platform Admin"}
              </span>
              <span className="text-[10px] text-zinc-400 truncate">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 shrink-0 border-b border-zinc-800/80 bg-[#111419]/50 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-zinc-400 hover:text-white p-1"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <span className="text-zinc-500">Platform Admin</span>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-200 capitalize">
                {pathname === "/platform-admin"
                  ? "Dashboard"
                  : pathname.split("/platform-admin/")[1]?.replace(/-/g, " ") || "Console"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Visit Portal</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>
        </header>

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
