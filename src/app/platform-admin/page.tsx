"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Layers,
  Award,
} from "lucide-react";
import { toast } from "sonner";

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  trialTenants: number;
  totalUsers: number;
  totalClubs: number;
  totalEvents: number;
}

interface RecentTenant {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  status: "active" | "suspended" | "trial";
  plan?: string;
  createdAt: string;
}

export default function PlatformAdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentTenants, setRecentTenants] = useState<RecentTenant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/platform-admin/stats");
      if (!res.ok) {
        throw new Error("Failed to load platform stats");
      }
      const data = await res.json();
      setStats(data.stats);
      setRecentTenants(data.recentTenants || []);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong loading dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Colleges",
      value: stats?.totalTenants ?? 0,
      icon: Building2,
      color: "from-indigo-500/20 to-violet-500/10",
      textColor: "text-indigo-400",
      borderColor: "border-indigo-500/20",
      subtext: `${stats?.activeTenants ?? 0} active, ${stats?.trialTenants ?? 0} trial`,
    },
    {
      title: "Total Students & Admins",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "from-emerald-500/20 to-teal-500/10",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
      subtext: "Across all institutions",
    },
    {
      title: "Active Clubs",
      value: stats?.totalClubs ?? 0,
      icon: Layers,
      color: "from-amber-500/20 to-yellow-500/10",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/20",
      subtext: "Student organizations",
    },
    {
      title: "Platform Events",
      value: stats?.totalEvents ?? 0,
      icon: Calendar,
      color: "from-cyan-500/20 to-blue-500/10",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/20",
      subtext: "Workshops & hackathons",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-[#13151f] to-zinc-900 border border-indigo-900/30 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Multi-Tenant SaaS Console
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Platform Administration
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl">
              Monitor, configure, and provision college tenants across Clubly. Manage subdomains, email domain restrictions, and global memberships.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white transition-colors hover:border-zinc-700"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/platform-admin/tenants?action=new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard College</span>
            </Link>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.color} bg-zinc-900/60 backdrop-blur-sm p-5 space-y-3 transition-all hover:border-zinc-700`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl bg-zinc-950/40 ${card.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-white font-mono">
                  {loading ? (
                    <div className="h-8 w-16 bg-zinc-800/80 rounded animate-pulse" />
                  ) : (
                    card.value.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-1">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Tenants & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Colleges */}
        <div className="lg:col-span-2 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Recently Provisioned Colleges
              </h2>
              <p className="text-xs text-zinc-400">
                Latest higher-education institutions on the platform
              </p>
            </div>
            <Link
              href="/platform-admin/tenants"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {recentTenants.length === 0 && !loading && (
              <div className="py-12 text-center text-zinc-500 text-sm">
                No organizations provisioned yet.
              </div>
            )}

            {recentTenants.map((tenant) => (
              <div
                key={tenant._id}
                className="py-4 flex items-center justify-between gap-4 first:pt-1 last:pb-1 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {tenant.logo ? (
                    <img
                      src={tenant.logo}
                      alt={tenant.name}
                      className="w-10 h-10 rounded-xl object-contain bg-zinc-950 p-1 border border-zinc-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-900/50 to-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm font-bold text-indigo-300">
                      {tenant.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {tenant.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border ${
                          tenant.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : tenant.status === "trial"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {tenant.status}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">
                      {tenant.slug}.clubly.app
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-zinc-500 hidden sm:inline">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/platform-admin/tenants?edit=${tenant._id}`}
                    className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Multi-Tenant Architecture & Quick Links */}
        <div className="space-y-6">
          {/* Isolation Engine Info */}
          <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Multi-Tenancy Guard
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every database query automatically scopes to the active tenant via AsyncLocalStorage. No cross-tenant data leakages are possible.
            </p>
            <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Subdomain Routing:</span>
                <span className="text-emerald-400 font-mono">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shared Collections:</span>
                <span className="text-indigo-400 font-mono">20+ Models</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Email Domain Lock:</span>
                <span className="text-emerald-400 font-mono">Enforced</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-2xl bg-gradient-to-b from-indigo-950/20 to-zinc-900/50 border border-indigo-900/20 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Management Shortcuts</h3>
            <div className="space-y-2">
              <Link
                href="/platform-admin/tenants?action=new"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-indigo-400" /> Onboard New College
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>
              <Link
                href="/platform-admin/users"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-400" /> Global User Directory
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
