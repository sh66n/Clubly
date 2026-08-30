"use client";

import React, { useState, useEffect } from "react";
import {
  Handshake,
  Check,
  X,
  Clock,
  Building,
  Calendar,
  Trophy,
  Sparkles,
  ExternalLink,
  Loader2,
  Inbox,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";

export default function CollabRequestsPage() {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [data, setData] = useState<{ incoming: any[]; outgoing: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/club-admin/collaborations");
      if (!res.ok) throw new Error("Failed to load collaborations");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      toast.error(err.message || "Failed to load collaborations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const handleRespond = async (id: string, action: "accept" | "reject") => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/club-admin/collaborations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${action} collaboration`);
      }

      toast.success(
        action === "accept"
          ? "Collaboration request accepted! You are now co-hosting this event."
          : "Collaboration request declined."
      );
      fetchCollaborations();
    } catch (err: any) {
      toast.error(err.message || "Failed to update collaboration");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel / remove this collaboration?")) return;
    try {
      setActionLoading(id);
      const res = await fetch(`/api/club-admin/collaborations/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove collaboration");
      }

      toast.success("Collaboration removed");
      fetchCollaborations();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove collaboration");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <ClublyLoader />;
  }

  const incomingList = data?.incoming || [];
  const outgoingList = data?.outgoing || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Handshake className="text-[#7CB342]" /> Club Collab Requests
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage co-hosting invitations between clubs for Events, SuperEvents, and Hackathons.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("incoming")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 transition border-b-2 ${
            activeTab === "incoming"
              ? "border-[#7CB342] text-[#7CB342]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Inbox size={16} />
          <span>Received Invitations</span>
          {incomingList.filter((i) => i.status === "pending").length > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
              {incomingList.filter((i) => i.status === "pending").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("outgoing")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 transition border-b-2 ${
            activeTab === "outgoing"
              ? "border-[#7CB342] text-[#7CB342]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Send size={16} />
          <span>Sent Invitations</span>
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
            {outgoingList.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {activeTab === "incoming" && (
        <div className="space-y-4">
          {incomingList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <Inbox size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Invitations Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                When other clubs invite your club to co-host their events, the requests will show up here.
              </p>
            </div>
          ) : (
            incomingList.map((collab) => (
              <div
                key={collab._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                    {collab.initiatorClub?.logo ? (
                      <img
                        src={collab.initiatorClub.logo}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building size={20} className="text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">
                        {collab.initiatorClub?.name || "A Club"}
                      </span>
                      <span className="text-xs text-slate-400">invited you to co-host</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-100 text-slate-700">
                        {collab.entityType}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      {collab.entity?.name || "Untitled Experience"}
                    </p>

                    {collab.message && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-lg mt-1 italic">
                        "{collab.message}"
                      </p>
                    )}

                    <p className="text-[11px] text-slate-400">
                      Received on {new Date(collab.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  {collab.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleRespond(collab._id, "reject")}
                        disabled={actionLoading === collab._id}
                        className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                      >
                        <X size={14} /> Decline
                      </button>
                      <button
                        onClick={() => handleRespond(collab._id, "accept")}
                        disabled={actionLoading === collab._id}
                        className="px-4 py-2 bg-[#7CB342] text-white hover:bg-[#689f38] text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        {actionLoading === collab._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        Accept & Co-Host
                      </button>
                    </>
                  ) : collab.status === "accepted" ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
                        <Check size={12} /> Accepted & Co-Hosting
                      </span>
                    </div>
                  ) : (
                    <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold">
                      Declined
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "outgoing" && (
        <div className="space-y-4">
          {outgoingList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <Send size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Sent Invitations</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Invite partner clubs to co-host your events, superevents, or hackathons directly from their admin edit panels.
              </p>
            </div>
          ) : (
            outgoingList.map((collab) => (
              <div
                key={collab._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                    {collab.targetClub?.logo ? (
                      <img
                        src={collab.targetClub.logo}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building size={20} className="text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400">Invited club</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {collab.targetClub?.name || "A Club"}
                      </span>
                      <span className="text-xs text-slate-400">for</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-100 text-slate-700">
                        {collab.entityType}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      {collab.entity?.name || "Untitled Experience"}
                    </p>

                    {collab.message && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-lg mt-1 italic">
                        "{collab.message}"
                      </p>
                    )}

                    <p className="text-[11px] text-slate-400">
                      Sent on {new Date(collab.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Status & Cancel */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  {collab.status === "pending" ? (
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1">
                      <Clock size={12} /> Pending Response
                    </span>
                  ) : collab.status === "accepted" ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
                      <Check size={12} /> Active Collaborator
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold">
                      Declined
                    </span>
                  )}

                  <button
                    onClick={() => handleCancel(collab._id)}
                    disabled={actionLoading === collab._id}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                    title="Remove collaboration"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
