"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, Key, LogOut, Loader2, CheckCircle2, Copy, Shield } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TeamFormationProps {
  hackathon: any;
  userTeam?: any | null;
  currentUser?: any;
}

export default function TeamFormation({
  hackathon,
  userTeam: initialUserTeam,
  currentUser,
}: TeamFormationProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"browse" | "join" | "create">("browse");
  const [teams, setTeams] = useState<any[]>([]);
  const [userTeam, setUserTeam] = useState<any>(initialUserTeam);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Form states
  const [joinCode, setJoinCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const hackathonId = hackathon._id;
  const maxSize = hackathon.teamSizeRange?.max || hackathon.teamSize || 5;

  const fetchTeamsAndStatus = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch(`/api/hackathons/${hackathonId}/teams`);
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }

      // Check current user's team status
      const statusRes = await fetch(`/api/hackathons/${hackathonId}/status`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setUserTeam(statusData.myTeam);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsAndStatus();
  }, [hackathonId]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName.trim(),
          isPublic,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create team");
      }

      const newTeam = await res.json();
      setUserTeam(newTeam);
      toast.success(`Team "${newTeam.name}" created successfully!`);
      setTeamName("");
      fetchTeamsAndStatus();
    } catch (err: any) {
      toast.error(err.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (codeToUse?: string) => {
    const code = (codeToUse || joinCode).trim();
    if (!code) {
      toast.error("Please enter a valid join code");
      return;
    }

    setLoading(true);
    try {
      // Find team with this code
      const targetTeam = teams.find((t) => t.joinCode === code);
      const teamId = targetTeam ? targetTeam._id : "by-code";

      const res = await fetch(`/api/hackathons/${hackathonId}/teams/${teamId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: code }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to join team");
      }

      const updatedTeam = await res.json();
      setUserTeam(updatedTeam);
      toast.success("Joined team successfully!");
      setJoinCode("");
      fetchTeamsAndStatus();
    } catch (err: any) {
      toast.error(err.message || "Failed to join team");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinDirect = async (teamId: string, code?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/teams/${teamId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: code }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to join team");
      }

      const updatedTeam = await res.json();
      setUserTeam(updatedTeam);
      toast.success("Joined team successfully!");
      fetchTeamsAndStatus();
    } catch (err: any) {
      toast.error(err.message || "Failed to join team");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName || "this member"} from the team?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/teams/${userTeam._id}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove member");
      }

      toast.success(`${memberName || "Member"} removed from team`);
      fetchTeamsAndStatus();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!userTeam) return;
    if (!confirm("Are you sure you want to leave this team?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/teams/${userTeam._id}/leave`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to leave team");
      }

      setUserTeam(null);
      toast.success("You left the team");
      fetchTeamsAndStatus();
    } catch (err: any) {
      toast.error(err.message || "Failed to leave team");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterTeam = async () => {
    if (!userTeam) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: userTeam._id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Registration failed");
      }

      toast.success("Team registered for hackathon successfully!");
      router.push(`/hackathons/${hackathonId}/success`);
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (userTeam) {
    const isLeader =
      userTeam.leader?._id === currentUser?.id ||
      userTeam.leader === currentUser?.id;

    return (
      <div className="bg-[#121212] rounded-2xl border border-[#2a2a2a] p-6 sm:p-8 space-y-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2a2a] pb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#7CB342] font-bold">
              Active Team Roster
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">{userTeam.name}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLeaveTeam}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              {isLeader && userTeam.members?.length === 1 ? "Disband Team" : "Leave Team"}
            </button>

            {isLeader && (
              <button
                onClick={handleRegisterTeam}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-[#7CB342] text-white hover:bg-[#689f38] rounded-xl transition text-xs font-bold shadow-lg"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Confirm & Submit Team Registration
              </button>
            )}
          </div>
        </div>

        {/* Private Join Code Box */}
        {userTeam.joinCode && (
          <div className="bg-black/50 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 font-medium">Team Invitation Code:</p>
              <p className="text-xs text-gray-500">
                Share this 6-character code with your teammates to let them join your roster.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <code className="bg-[#1c1c1c] border border-gray-700 px-3.5 py-1.5 rounded-lg text-lg font-mono font-bold tracking-widest text-[#7CB342]">
                {userTeam.joinCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(userTeam.joinCode);
                  toast.success("Join code copied to clipboard!");
                }}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Members Grid */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-200">
              Team Members ({userTeam.members?.length || 1} / {maxSize})
            </h4>
            <span className="text-xs text-gray-400">
              {maxSize - (userTeam.members?.length || 1)} slots available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userTeam.members?.map((member: any, i: number) => {
              const memberId = member._id || member;
              const isMemberLeader =
                userTeam.leader?._id === memberId || userTeam.leader === memberId;

              return (
                <div
                  key={memberId || i}
                  className="flex items-center gap-3 p-3.5 bg-black/40 border border-[#2a2a2a] rounded-xl"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1e1e1e] border border-gray-700 overflow-hidden flex items-center justify-center font-bold text-gray-300 uppercase shrink-0">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name || "Member"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      member.name?.[0] || "U"
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-bold text-white text-xs truncate">
                      {member.name || "Teammate"}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {member.department || member.email}
                    </p>
                  </div>
                  {isMemberLeader ? (
                    <span className="text-[10px] font-bold bg-[#7CB342]/10 text-[#7CB342] border border-[#7CB342]/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Shield size={10} /> Leader
                    </span>
                  ) : isLeader ? (
                    <button
                      onClick={() => handleRemoveMember(memberId, member.name)}
                      disabled={loading}
                      className="text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20 font-semibold transition flex items-center gap-1"
                      title="Kick member from team"
                    >
                      <LogOut size={11} /> Kick
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] rounded-2xl border border-[#2a2a2a] overflow-hidden text-white">
      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a]">
        <button
          onClick={() => setActiveTab("browse")}
          className={`flex-1 py-4 text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTab === "browse"
              ? "text-[#7CB342] border-b-2 border-[#7CB342] bg-white/[0.02]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" /> Browse Public Teams
        </button>

        <button
          onClick={() => setActiveTab("join")}
          className={`flex-1 py-4 text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTab === "join"
              ? "text-[#7CB342] border-b-2 border-[#7CB342] bg-white/[0.02]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Key className="w-4 h-4" /> Join With Private Code
        </button>

        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 py-4 text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTab === "create"
              ? "text-[#7CB342] border-b-2 border-[#7CB342] bg-white/[0.02]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <UserPlus className="w-4 h-4" /> Create New Team
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {/* Tab 1: Browse Public Teams */}
        {activeTab === "browse" && (
          <div className="space-y-4">
            {fetchLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Users size={32} className="mx-auto text-gray-600 mb-2" />
                <p className="text-sm font-bold text-gray-300">No public teams found</p>
                <p className="text-xs text-gray-500">
                  Be the first to create a team and invite your friends!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => {
                  const currentCount = team.members?.length || 1;
                  const teamMaxSize = team.maxSize || maxSize;
                  const isTeamFull = currentCount >= teamMaxSize;

                  return (
                    <div
                      key={team._id}
                      className="p-4 rounded-xl bg-black/40 border border-[#2a2a2a] flex items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{team.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Leader: {team.leader?.name || "User"} • {currentCount}/{teamMaxSize} Members
                        </p>
                      </div>
                      {!isTeamFull ? (
                        <button
                          onClick={() => handleJoinDirect(team._id, team.joinCode)}
                          disabled={loading}
                          className="px-4 py-1.5 bg-[#7CB342] text-white text-xs font-bold rounded-lg hover:bg-[#689f38] transition disabled:opacity-50"
                        >
                          Join Team
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500 font-semibold px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                          Full
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Join By Code */}
        {activeTab === "join" && (
          <form onSubmit={(e) => { e.preventDefault(); handleJoinTeam(); }} className="max-w-md mx-auto py-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-[#7CB342]/10 text-[#7CB342] flex items-center justify-center mx-auto border border-[#7CB342]/20">
              <Key size={20} />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Enter Team Join Code</h3>
              <p className="text-xs text-gray-400 mt-1">
                Enter the 6-character code given by your team leader to join their roster.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. A1B2C3"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-2.5 text-center text-sm font-mono font-bold tracking-widest text-white uppercase focus:border-[#7CB342] focus:outline-none"
                maxLength={8}
                required
              />
              <button
                type="submit"
                disabled={loading || !joinCode.trim()}
                className="bg-[#7CB342] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#689f38] transition text-xs disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Join"}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Create Team */}
        {activeTab === "create" && (
          <form onSubmit={handleCreateTeam} className="max-w-md mx-auto py-4 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Team Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Code Warriors"
                className="w-full bg-black border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#7CB342] focus:outline-none"
                required
              />
            </div>

            <div className="p-3.5 bg-black/40 border border-[#2a2a2a] rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7CB342] focus:ring-[#7CB342]"
                />
                <div>
                  <p className="text-xs font-bold text-white">List team in public directory</p>
                  <p className="text-[11px] text-gray-400">
                    Allow other students to discover and join your team.
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !teamName.trim()}
              className="w-full bg-[#7CB342] text-white py-3 rounded-xl font-bold hover:bg-[#689f38] transition text-xs shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Creating..." : "Create Team Roster"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
