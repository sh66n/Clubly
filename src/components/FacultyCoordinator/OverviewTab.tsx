"use client";
import React from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  Image as ImageIcon,
  Clock,
  Eye,
} from "lucide-react";

interface OverviewTabProps {
  data: any;
  onViewEvent?: (eventId: string) => void;
  onNavigateToNaac?: (eventId: string) => void;
}

export default function OverviewTab({
  data,
  onNavigateToNaac,
}: OverviewTabProps) {
  if (!data) return null;

  const { club, stats, recentEvents } = data;

  const statCards = [
    {
      label: "Total Events",
      value: stats.totalEvents,
      subtext: `${stats.completedEvents} Completed • ${stats.liveEvents} Live`,
      icon: <Calendar size={18} className="text-[#7CB342]" />,
    },
    {
      label: "Students Engaged",
      value: stats.totalAttended,
      subtext: `From ${stats.totalRegistrations} total registrations`,
      icon: <Users size={18} className="text-blue-500" />,
    },
    {
      label: "Points Distributed",
      value: stats.totalPointsDistributed.toLocaleString(),
      subtext: "Recognitions & awards",
      icon: <Award size={18} className="text-amber-500" />,
    },
    {
      label: "Club Community",
      value: club.followersCount.toLocaleString(),
      subtext: `${club.name} followers`,
      icon: <CheckCircle2 size={18} className="text-emerald-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Club Banner Header */}
      <div
        className="rounded-2xl p-6 text-white border border-[#2d5c0c] relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 500px 250px at bottom right, #254f0a 0%, #040c00 100%)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {club.logo ? (
              <img
                src={club.logo}
                alt={club.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 bg-white/5"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#7CB342]/20 border border-white/20 flex items-center justify-center text-2xl font-black text-[#9ccc65]">
                {club.name?.charAt(0) || "C"}
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ccc65] bg-white/10 px-2 py-0.5 rounded-full">
                {club.department || "Academic Department"}
              </span>
              <h2 className="text-xl md:text-2xl font-bold mt-1 text-white">
                {club.fullName || club.name}
              </h2>
              <p className="text-xs text-[#c5d6a8] mt-0.5">
                Official Faculty Oversight & Compliance Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Accreditation Cycle Active
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between min-h-[120px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {card.label}
              </span>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                {card.icon}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                {card.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Events Table Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Events Overview</h3>
            <p className="text-xs text-slate-500">
              Verified record of events, attendance turnout, and photo glimpses.
            </p>
          </div>
          <span className="text-xs font-bold text-[#558B2F] bg-[#f0f7e6] px-3 py-1 rounded-full border border-[#d5e9b8]">
            {recentEvents.length} Events Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Event Name</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Format</th>
                <th className="py-3 px-3">Attended / Registered</th>
                <th className="py-3 px-3">NAAC Photos</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No events recorded for the selected academic cycle.
                  </td>
                </tr>
              ) : (
                recentEvents.map((ev: any) => (
                  <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img
                            src={ev.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{ev.name}</p>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 ${
                              ev.status === "live"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : ev.status === "completed"
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {ev.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                      {new Date(ev.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 capitalize font-medium">
                      {ev.eventType} Event
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      <span className="text-[#558B2F] font-bold">{ev.attendedCount}</span>
                      <span className="text-slate-400 font-normal"> / {ev.registrationsCount}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      {ev.hasPhotos ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#558B2F] bg-[#f0f7e6] border border-[#d5e9b8] px-2 py-0.5 rounded-lg">
                          <ImageIcon size={12} />
                          {ev.photosCount} Photos
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No photos</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/faculty-coordinator/events/${ev.id}`}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5"
                        >
                          <Eye size={13} className="text-[#558B2F]" />
                          Monitor
                        </Link>
                        {onNavigateToNaac && (
                          <button
                            onClick={() => onNavigateToNaac(ev.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-[#7CB342] hover:bg-[#689F38] rounded-xl transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                          >
                            Generate NAAC
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
