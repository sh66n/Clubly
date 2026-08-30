"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";
import {
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Pencil,
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  Handshake,
  CheckSquare,
  Settings,
  HelpCircle,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";
import RegistrationsTable from "@/components/Hackathons/Admin/RegistrationsTable";
import RoundManager from "@/components/Hackathons/Admin/RoundManager";
import SubmissionsTable from "@/components/Hackathons/Admin/SubmissionsTable";
import ShortlistingPanel from "@/components/Hackathons/Admin/ShortlistingPanel";
import EditHackathonForm from "@/components/Hackathons/EditHackathonForm";
import CollabSection from "@/components/ClubAdmin/CollabSection";

type HackathonTab =
  | "registrations"
  | "rounds"
  | "submissions"
  | "shortlist"
  | "collab"
  | "settings";

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

export default function HackathonAdminDetailsPage() {
  const params = useParams();
  const hackathonId = params.id as string;
  const router = useRouter();

  const [data, setData] = useState<{
    hackathon: any;
    rounds: any[];
    registrationCount?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const [activeTab, setActiveTab] = useState<HackathonTab>("registrations");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [timeFilterOpen, setTimeFilterOpen] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/hackathons/${hackathonId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch hackathon details");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    if (hackathonId && hackathonId !== "new") {
      fetchDetails();
    } else {
      setLoading(false);
    }
  }, [hackathonId, fetchDetails]);

  const handleStatusChange = async (newStatus: "draft" | "live" | "completed") => {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/club-admin/hackathons/${hackathonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Hackathon marked as ${newStatus}`);
      fetchDetails();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <ClublyLoader />
      </div>
    );
  }

  if (error || (!data && hackathonId !== "new")) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-sm mx-auto mt-10">
        <AlertTriangle size={24} className="text-slate-400 mx-auto mb-2" />
        <p className="font-bold text-slate-800 text-sm">Failed to load hackathon</p>
        <p className="text-xs text-slate-400 mt-1">{error || "Hackathon not found"}</p>
        <button
          onClick={fetchDetails}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const hackathon = data?.hackathon;
  const rounds = data?.rounds || [];
  const createdAt = new Date(hackathon?.createdAt || Date.now());

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => router.push("/club-admin/hackathons")}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors outline-none mb-6"
      >
        <ArrowLeft size={14} /> Back to Hackathons
      </button>

      {/* Header Info Banner Container (Matching /events/[id]) */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-stretch">
        {hackathon.image && (
          <div className="w-full lg:w-80 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-900 min-h-[220px]">
            <img
              src={hackathon.image}
              alt={hackathon.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-start gap-4">
          <div className="flex flex-col gap-3 flex-grow">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {hackathon.name}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100/80 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wide">
                  {hackathon.teamSizeRange?.min || 1}-
                  {hackathon.teamSizeRange?.max || hackathon.teamSize || 5} Members
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                    hackathon.status === "live"
                      ? "text-[#7CB342] bg-[#f0f7e6] border-[#c5d6a8]"
                      : hackathon.status === "completed"
                      ? "text-blue-700 bg-blue-50 border-blue-200"
                      : "text-slate-600 bg-slate-100 border-slate-200"
                  }`}
                >
                  {hackathon.status}
                </span>
              </div>
            </div>

            <div className="flex-grow min-h-0">
              <p
                className={`text-sm text-slate-500 font-medium leading-relaxed max-w-3xl ${
                  !descExpanded ? "line-clamp-3 lg:line-clamp-5" : ""
                }`}
                title={hackathon.description}
              >
                {hackathon.description || "No description provided."}
              </p>
              {hackathon.description && hackathon.description.length > 200 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="text-xs font-bold text-[#7CB342] hover:text-[#689F38] mt-1 inline-flex items-center gap-0.5 transition-colors outline-none"
                >
                  {descExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </div>

            {/* Minimal metadata info strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 text-xs text-slate-500 font-semibold border-t border-slate-100 mt-auto">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                Created:{" "}
                {createdAt.toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={13} className="text-slate-400" />
                {data?.registrationCount || 0} Registered Participants
              </span>
              <span className="flex items-center gap-1.5">
                <Layers size={13} className="text-slate-400" />
                {rounds.length} Stage Rounds
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap pt-2">
            <Link
              href={`/hackathons/${hackathonId}`}
              target="_blank"
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <ExternalLink size={14} /> Public Page
            </Link>

            <button
              onClick={() => setActiveTab("settings")}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Pencil size={14} /> Edit Hackathon
            </button>

            {hackathon.status === "draft" && (
              <button
                onClick={() => handleStatusChange("live")}
                disabled={statusLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#7CB342] hover:bg-[#689F38] rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {statusLoading && <Loader2 size={14} className="animate-spin" />}
                Publish Live
              </button>
            )}

            {hackathon.status === "live" && (
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={statusLoading}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {statusLoading && <Loader2 size={14} className="animate-spin" />}
                Mark Completed
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed Records Container */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Hackathon Management
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Manage participant rosters, stage rounds, submissions, and shortlist criteria.
            </p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide bg-slate-200/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("registrations")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "registrations"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              <Users size={14} /> Registrations ({data?.registrationCount || 0})
            </button>

            <button
              onClick={() => setActiveTab("rounds")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "rounds"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              <Layers size={14} /> Rounds ({rounds.length})
            </button>

            <button
              onClick={() => setActiveTab("submissions")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "submissions"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              <FileText size={14} /> Submissions
            </button>

            <button
              onClick={() => setActiveTab("shortlist")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "shortlist"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              <CheckSquare size={14} /> Shortlisting
            </button>

            <button
              onClick={() => setActiveTab("collab")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "collab"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              <Handshake size={14} /> Co-Hosting
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "settings"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              <Settings size={14} /> Edit & Settings
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="p-6 text-slate-900">
          {activeTab === "registrations" && (
            <RegistrationsTable
              hackathonId={hackathon._id}
              hackathonName={hackathon.name}
            />
          )}

          {activeTab === "rounds" && (
            <RoundManager
              hackathonId={hackathon._id}
              rounds={rounds}
              fetchDetails={fetchDetails}
            />
          )}

          {activeTab === "submissions" && (
            <SubmissionsTable
              hackathonId={hackathon._id}
              rounds={rounds}
            />
          )}

          {activeTab === "shortlist" && (
            <ShortlistingPanel
              hackathonId={hackathon._id}
              rounds={rounds}
            />
          )}

          {activeTab === "collab" && (
            <CollabSection
              entityType="hackathon"
              entityId={hackathon._id}
              collaboratingClubs={hackathon.collaboratingClubs || []}
              onCollabUpdated={fetchDetails}
            />
          )}

          {activeTab === "settings" && (
            <EditHackathonForm
              hackathon={hackathon}
              onSuccess={fetchDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
}
