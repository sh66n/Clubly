"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";
import {
  Plus,
  Search,
  Calendar,
  Users,
  Trophy,
  FileText,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  Rocket,
  Upload,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   Types & Tooltip
   ═══════════════════════════════════════════ */
type HackathonStatus = "draft" | "live" | "completed";
type TabKey = "all" | "live" | "draft" | "completed";

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((p) => !p)}
        className="text-[#9ccc65]/80 hover:text-white transition-colors"
      >
        <HelpCircle size={14} />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-xl border border-slate-700 z-50 pointer-events-none text-center font-normal leading-tight">
          {text}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Hackathon Row Component
   ═══════════════════════════════════════════ */
function HackathonRow({
  hackathon,
  onStatusChange,
  onDelete,
  onViewDetail,
}: {
  hackathon: any;
  onStatusChange: (status: HackathonStatus) => void;
  onDelete: () => void;
  onViewDetail: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const createdAt = new Date(hackathon.createdAt || Date.now());

  return (
    <tr className="group hover:bg-[#f0f7e6]/50 transition-colors border-b border-slate-100 last:border-0 relative">
      <td className="py-4 pl-6 pr-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-[#7CB342] focus:ring-[#7CB342] cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-slate-500 font-medium text-sm">
            #{hackathon._id.slice(-8)}
          </span>
        </div>
      </td>

      <td
        className="px-4 py-4 whitespace-nowrap min-w-[220px] cursor-pointer"
        onClick={onViewDetail}
      >
        <div className="flex items-center gap-3">
          {hackathon.image ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200/50 bg-slate-900">
              <img
                src={hackathon.image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[#f0f7e6] flex items-center justify-center shrink-0 text-[#7CB342] border border-[#c5d6a8]">
              <Trophy size={16} />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 hover:text-[#7CB342] transition-colors">
              {hackathon.name}
            </span>
            {hackathon.description && (
              <p
                className="text-xs text-slate-500 truncate w-56"
                title={hackathon.description}
              >
                {hackathon.description}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
          {hackathon.teamSizeRange?.min || 1}-{hackathon.teamSizeRange?.max || hackathon.teamSize || 5} Members
        </span>
      </td>

      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
        {createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>

      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
        {hackathon.teamsCount || 0} Teams ({hackathon.registrationsCount || 0} participants)
      </td>

      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
        {hackathon.submissionsCount || 0}
      </td>

      <td className="px-4 py-4 whitespace-nowrap">
        {hackathon.status === "live" && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#f0f7e6] text-[#7CB342] border border-[#c5d6a8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7CB342] animate-pulse" />
            Live
          </span>
        )}
        {hackathon.status === "draft" && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
            Draft
          </span>
        )}
        {hackathon.status === "completed" && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Completed
          </span>
        )}
      </td>

      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
        <div className="relative inline-block text-left" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onViewDetail();
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Layers size={14} className="text-slate-400" /> Manage Hackathon
              </button>

              <Link
                href={`/hackathons/${hackathon._id}`}
                target="_blank"
                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <ExternalLink size={14} className="text-slate-400" /> Public Page
              </Link>

              <div className="h-px bg-slate-100 my-1" />

              {hackathon.status === "draft" && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onStatusChange("live");
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-[#7CB342] hover:bg-[#f0f7e6] flex items-center gap-2"
                >
                  <Rocket size={14} /> Publish Live
                </button>
              )}

              {hackathon.status === "live" && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onStatusChange("completed");
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                >
                  <CheckCircle2 size={14} /> Mark Completed
                </button>
              )}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ═══════════════════════════════════════════
   Main Hackathons Overview Page
   ═══════════════════════════════════════════ */
export default function ClubAdminHackathonsPage() {
  const router = useRouter();
  const [data, setData] = useState<{ hackathons: any[]; metrics: any } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [timeFilterOpen, setTimeFilterOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/club-admin/hackathons");
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to load hackathons");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load hackathons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const hackathons = data?.hackathons || [];
  const metrics = data?.metrics || {};

  const filteredHackathons = useMemo(() => {
    let result = hackathons;
    if (activeTab !== "all") {
      result = result.filter((h) => h.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((h) => h.name.toLowerCase().includes(q));
    }
    return result;
  }, [hackathons, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredHackathons.length / itemsPerPage);
  const paginatedHackathons = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHackathons.slice(start, start + itemsPerPage);
  }, [filteredHackathons, currentPage, itemsPerPage]);

  const handleStatusChange = async (
    hackathonId: string,
    newStatus: HackathonStatus
  ) => {
    try {
      const res = await fetch(`/api/club-admin/hackathons/${hackathonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Hackathon is now ${newStatus}`);
      fetchHackathons();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/club-admin/hackathons/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete hackathon");
      toast.success("Hackathon deleted successfully");
      setDeleteTarget(null);
      fetchHackathons();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "all", label: "All Hackathons", count: metrics.totalHackathons },
    { key: "live", label: "Live", count: metrics.live },
    { key: "draft", label: "Drafts", count: metrics.draft },
    { key: "completed", label: "Completed", count: metrics.completed },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <ClublyLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-sm mx-auto mt-10">
        <AlertTriangle size={24} className="text-slate-400 mx-auto mb-2" />
        <p className="font-bold text-slate-800 text-sm">Failed to connect</p>
        <p className="text-xs text-slate-400 mt-1">{error}</p>
        <button
          onClick={fetchHackathons}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Hackathons Overview
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage your club&apos;s hackathons, multi-round stages, and team submissions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm flex items-center gap-2">
            <Upload size={14} /> Export
          </button>
          <Link
            href="/club-admin/hackathons/new"
            className="px-4 py-2 text-sm font-semibold text-white bg-[#7CB342] hover:bg-[#689F38] rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Plus size={16} /> Create Hackathon
          </Link>
        </div>
      </div>

      {/* Emerald Hero Stats Banner (Matches Events Page) */}
      <div
        className="border border-[#2d5c0c] text-white rounded-2xl shadow-md flex flex-col lg:flex-row mb-8 relative"
        style={{
          background:
            "radial-gradient(ellipse 1250px 100px at bottom right, #254f0a 0%, #040c00 100%)",
        }}
      >
        {/* Grain Overlay */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-[0.95] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' result='noise'/%3E%3CfeColorMatrix type='matrix' values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1.5 -0.2'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='3.2' intercept='-1.0'/%3E%3CfeFuncG type='linear' slope='3.2' intercept='-1.0'/%3E%3CfeFuncB type='linear' slope='3.2' intercept='-1.0'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Time Filter Pill */}
        <div
          onClick={() => setTimeFilterOpen(!timeFilterOpen)}
          className="relative flex items-center justify-center p-6 lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-[#224b0a] cursor-pointer bg-[#132c02]/20 hover:bg-[#132c02]/50 transition-colors duration-200 rounded-t-2xl lg:rounded-t-none lg:rounded-l-2xl z-10"
        >
          <button className="flex items-center gap-2 outline-none">
            <Calendar size={22} className="text-[#9ccc65]" strokeWidth={2.5} />
            <span className="font-bold text-[#9ccc65] text-lg tracking-tight flex items-center gap-1">
              {timeFilter} <ChevronDown size={14} className="opacity-75" />
            </span>
          </button>

          {timeFilterOpen && (
            <div className="absolute top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-1.5 w-40 z-50 text-slate-800">
              {["Today", "Last 7 Days", "This Month", "All Time"].map((opt) => (
                <button
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimeFilter(opt);
                    setTimeFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    timeFilter === opt
                      ? "bg-[#f0f7e6] text-[#7CB342]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3 Metric Columns */}
        <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#224b0a]">
          <div className="flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#9ccc65]">
                Total Hackathons
              </span>
              <InfoTooltip text="Total hackathons created by your club." />
            </div>
            <div className="flex items-end justify-between mt-auto">
              <span className="text-4xl font-bold text-white tracking-tight">
                {metrics.totalHackathons || 0}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#9ccc65]">
                Registered Teams
              </span>
              <InfoTooltip text="Total teams formed across all hackathons." />
            </div>
            <div className="flex items-end justify-between mt-auto">
              <span className="text-4xl font-bold text-white tracking-tight">
                {metrics.totalTeams || 0}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#9ccc65]">
                Submissions & Registrations
              </span>
              <InfoTooltip text="Total submissions received and participants." />
            </div>
            <div className="flex items-end justify-between mt-auto">
              <span className="text-4xl font-bold text-white tracking-tight">
                {metrics.totalSubmissions || 0}
              </span>
              <span className="text-xs font-semibold text-[#9ccc65]">
                {metrics.totalRegistrations || 0} participants
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search bar Table Container */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Hackathon Summary</h2>
            <p className="text-sm text-slate-500 mt-1">
              Overview of hackathons, teams, and stage statuses.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search box */}
            <div className="flex items-center bg-white border border-slate-200 focus-within:border-[#7CB342] focus-within:ring-2 focus-within:ring-[#f0f7e6] rounded-xl px-3.5 py-2 gap-2 w-full sm:w-64 transition-all shadow-sm">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hackathons..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-full font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X size={13} className="text-slate-400" />
                </button>
              )}
            </div>

            <Link
              href="/club-admin/hackathons/new"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#7CB342] border border-[#7CB342] hover:bg-[#689F38] rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={14} /> New Hackathon
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="px-6 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all outline-none shrink-0 flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "text-[#689F38] bg-[#e2f1cd] shadow-sm border border-[#c5d6a8]"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
                }`}
              >
                {tab.label}
                {typeof tab.count === "number" && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key
                        ? "bg-[#689F38] text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List items block */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f7e6]/30 border-b border-slate-100">
                <th className="py-3 pl-6 pr-4 font-semibold text-slate-500 text-xs w-8">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 cursor-pointer"
                    disabled
                  />
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-xs">
                  Hackathon
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-xs">
                  Team Size
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-xs">
                  Created
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-xs">
                  Teams
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-xs">
                  Submissions
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-xs">
                  Status
                </th>
                <th className="py-3 pl-4 pr-6 font-semibold text-slate-500 text-xs text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedHackathons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Trophy className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="font-bold text-slate-700 text-sm">
                      No hackathons found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "Create a hackathon to get started"}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedHackathons.map((h) => (
                  <HackathonRow
                    key={h._id}
                    hackathon={h}
                    onStatusChange={(status) => handleStatusChange(h._id, status)}
                    onDelete={() => setDeleteTarget(h)}
                    onViewDetail={() => router.push(`/club-admin/hackathons/${h._id}`)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
            <p className="text-xs font-semibold text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredHackathons.length)} of{" "}
              {filteredHackathons.length} hackathons
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                    currentPage === p
                      ? "bg-[#7CB342] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-800 text-lg">
                Delete Hackathon?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-700">
                  {deleteTarget.name}
                </span>
                ? All rounds and submissions will be permanently removed.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition shadow-sm"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
