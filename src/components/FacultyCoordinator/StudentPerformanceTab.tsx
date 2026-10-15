"use client";
import React, { useState, useEffect } from "react";
import { Trophy, Medal, Award, Star, Search, Loader2, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

interface StudentRankItem {
  _id: string;
  name: string;
  image?: string;
  points: number;
  department?: string;
  year?: number;
}

interface StudentPerformanceTabProps {
  clubId: string;
  clubName: string;
}

export default function StudentPerformanceTab({
  clubId,
  clubName,
}: StudentPerformanceTabProps) {
  const [students, setStudents] = useState<StudentRankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLeaderboard = async () => {
    if (!clubId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/leaderboard?clubId=${clubId}&limit=50`);
      if (!res.ok) throw new Error("Failed to load student leaderboard");
      const data = await res.json();
      setStudents(data.topParticipants || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [clubId]);

  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    return s.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs shadow-xs">
          🥇
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shadow-xs">
          🥈
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs shadow-xs">
          🥉
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-xs">
        #{rank}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              Student Performance & Merit Nominations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked list of top student contributors and performers in {clubName}. Ideal for annual awards and compliance citations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#558B2F] bg-[#f0f7e6] border border-[#d5e9b8] px-3 py-1.5 rounded-xl">
              {students.length} Ranked Students
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 gap-2">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search student by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4 text-right">Points Earned</th>
                <th className="py-3 px-4 text-center">Nomination Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin text-[#7CB342] mx-auto" />
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No active student participants recorded for this club yet.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr key={student._id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">{getRankBadge(rank)}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.image ? (
                            <img
                              src={student.image}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                              <User size={13} />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800">{student.name}</p>
                            <span className="text-[10px] text-slate-400">
                              Verified Club Participant
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-sm text-[#558B2F]">
                        {student.points.toLocaleString()} pts
                      </td>

                      <td className="py-3 px-4 text-center">
                        {rank <= 3 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <Sparkles size={11} />
                            Dean's List / Top Performer
                          </span>
                        ) : rank <= 10 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <Award size={11} />
                            Merit Candidate
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Active Participant
                          </span>
                        )}
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
