"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Download,
  Shield,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface RegistrationsTableProps {
  hackathonId: string;
  hackathonName?: string;
}

export default function RegistrationsTable({
  hackathonId,
  hackathonName,
}: RegistrationsTableProps) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hackathons/${hackathonId}/registrations`);
      if (!res.ok) throw new Error("Failed to load registrations");
      const data = await res.json();
      setRegistrations(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [hackathonId]);

  const filteredRegistrations = useMemo(() => {
    if (!searchQuery.trim()) return registrations;
    const q = searchQuery.toLowerCase();
    return registrations.filter((reg) => {
      const teamName = reg.team?.name?.toLowerCase() || "";
      const leaderName = reg.team?.leader?.name?.toLowerCase() || "";
      const leaderEmail = reg.team?.leader?.email?.toLowerCase() || "";
      const hasMember = reg.team?.members?.some(
        (m: any) =>
          m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
      );
      return teamName.includes(q) || leaderName.includes(q) || leaderEmail.includes(q) || hasMember;
    });
  }, [registrations, searchQuery]);

  const downloadCSV = () => {
    if (registrations.length === 0) {
      toast.error("No registrations to export");
      return;
    }

    const headers = [
      "Team Name",
      "Registration Date",
      "Member Name",
      "Role",
      "Email",
      "Department",
      "Year",
      "Phone",
    ];

    const rows: string[][] = [];

    registrations.forEach((reg) => {
      const teamName = reg.team?.name || "Untitled Team";
      const regDate = new Date(reg.createdAt).toLocaleDateString();
      const leaderId = reg.team?.leader?._id || reg.team?.leader;

      reg.team?.members?.forEach((m: any) => {
        const isLeader = (m._id || m) === leaderId;
        rows.push([
          `"${teamName.replace(/"/g, '""')}"`,
          `"${regDate}"`,
          `"${(m.name || "").replace(/"/g, '""')}"`,
          `"${isLeader ? "Leader" : "Member"}"`,
          `"${m.email || ""}"`,
          `"${m.department || ""}"`,
          `"${m.year || ""}"`,
          `"${m.phoneNumber || ""}"`,
        ]);
      });
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${(hackathonName || "hackathon").toLowerCase().replace(/\s+/g, "_")}_participants.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully!");
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Actions bar matching Events Record Table */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="flex items-center bg-white border border-slate-200 focus-within:border-[#7CB342] focus-within:ring-2 focus-within:ring-[#f0f7e6] rounded-xl px-3.5 py-2 gap-2 w-full sm:w-72 transition-all shadow-2xs">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams or participants..."
            className="bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none w-full font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>

        <button
          onClick={downloadCSV}
          className="px-4 py-2 text-xs font-bold text-white bg-[#7CB342] hover:bg-[#689F38] rounded-xl transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Table matching the Event Participants Group View */}
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="max-h-[550px] overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 bg-white z-10">
                <th className="py-3.5 pl-6 pr-4 font-bold text-slate-400 text-[10px] tracking-wider uppercase w-8">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 cursor-pointer"
                    disabled
                  />
                </th>
                <th className="py-3.5 px-4 font-bold text-slate-400 text-[10px] tracking-wider uppercase">
                  Team / Leader
                </th>
                <th className="py-3.5 px-4 font-bold text-slate-400 text-[10px] tracking-wider uppercase">
                  Date Registered
                </th>
                <th className="py-3.5 pl-4 pr-6 font-bold text-slate-400 text-[10px] tracking-wider uppercase text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#7CB342] mb-2" />
                    <p className="text-xs font-medium">Loading participant records...</p>
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-slate-400 font-semibold text-xs"
                  >
                    No registrations logged.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg, rowIdx) => {
                  const team = reg.team || {};
                  const leaderId = team.leader?._id || team.leader;
                  const members: any[] = team.members || [];
                  const isNearBottom = rowIdx >= filteredRegistrations.length - 2 && filteredRegistrations.length > 2;

                  return (
                    <tr
                      key={reg._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 pl-6 pr-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 cursor-pointer text-[#7CB342] focus:ring-[#7CB342]"
                        />
                      </td>

                      {/* Group/Team column with smart top/bottom tooltip orientation */}
                      <td className="py-4 px-4 max-w-[280px] sm:max-w-[340px]">
                        <div className="space-y-2 py-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800 text-sm truncate max-w-[180px]">
                              {team.name || "Unknown Team"}
                            </p>
                            <span className="text-[9px] font-bold text-[#7CB342] bg-[#f0f7e6] border border-[#7CB342]/10 px-1.5 py-0.5 rounded-sm shrink-0">
                              {members.length || 0} Members
                            </span>
                          </div>

                          {/* Overlapping Avatar Stack */}
                          <div className="flex items-center">
                            <div className="flex -space-x-2 mr-3 py-1 shrink-0">
                              {members.map((m: any, idx: number) => {
                                const mId = m._id || m;
                                const isMemberLeader = mId === leaderId;

                                return (
                                  <div
                                    key={mId || idx}
                                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-100 relative group shrink-0 hover:scale-125 hover:z-30 transition-all duration-150 cursor-pointer"
                                  >
                                    <div className="w-full h-full rounded-full overflow-hidden">
                                      {m.image ? (
                                        <img
                                          src={m.image}
                                          alt=""
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center text-[9px] font-black text-slate-500 uppercase">
                                          {m.name?.charAt(0) || "U"}
                                        </div>
                                      )}
                                    </div>
                                    {isMemberLeader && (
                                      <div className="absolute inset-0 border border-[#7CB342] rounded-full" />
                                    )}

                                    {/* Minimalist Creme Tooltip (Positions Upwards for bottom rows to prevent clipping) */}
                                    <div
                                      className={`opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 bg-[#FAF6EE] text-slate-700 text-[10px] px-2.5 py-1.5 rounded-lg border border-[#E8DFD0] absolute whitespace-nowrap z-50 shadow-md font-semibold leading-tight ${
                                        isNearBottom
                                          ? "bottom-full mb-1.5"
                                          : "top-full mt-1.5"
                                      } ${
                                        idx === 0
                                          ? "left-0 translate-x-0"
                                          : "left-1/2 -translate-x-1/2"
                                      }`}
                                    >
                                      {/* Arrow Tail */}
                                      {isNearBottom ? (
                                        <>
                                          <div
                                            className={`absolute top-full w-0 h-0 border-4 border-transparent border-t-[#E8DFD0] ${
                                              idx === 0
                                                ? "left-3"
                                                : "left-1/2 -translate-x-1/2"
                                            }`}
                                          />
                                          <div
                                            className={`absolute top-full w-0 h-0 border-[3px] border-transparent border-t-[#FAF6EE] -translate-y-[1px] ${
                                              idx === 0
                                                ? "left-[13px]"
                                                : "left-1/2 -translate-x-1/2"
                                            }`}
                                          />
                                        </>
                                      ) : (
                                        <>
                                          <div
                                            className={`absolute bottom-full w-0 h-0 border-4 border-transparent border-b-[#E8DFD0] ${
                                              idx === 0
                                                ? "left-3"
                                                : "left-1/2 -translate-x-1/2"
                                            }`}
                                          />
                                          <div
                                            className={`absolute bottom-full w-0 h-0 border-[3px] border-transparent border-b-[#FAF6EE] translate-y-[1px] ${
                                              idx === 0
                                                ? "left-[13px]"
                                                : "left-1/2 -translate-x-1/2"
                                            }`}
                                          />
                                        </>
                                      )}

                                      <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">
                                          {m.name} {isMemberLeader && "(Leader)"}
                                        </span>
                                        {m.email && (
                                          <span className="text-[9px] text-slate-500 font-normal">
                                            {m.email}
                                          </span>
                                        )}
                                        {m.department && (
                                          <span className="text-[9px] text-slate-400 font-normal">
                                            {m.department} {m.year ? `• Year ${m.year}` : ""}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                              Leader:{" "}
                              <span className="font-bold text-slate-600">
                                {team.leader?.name || "Unknown"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600 font-medium text-sm">
                        {new Date(reg.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-4 pl-4 pr-6 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          Registered
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
