"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  Check,
  Building,
  AlertCircle,
  Sparkles,
  ChevronDown,
  X,
  Trash2,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  department?: string;
  year?: number;
}

interface ClubItem {
  id: string;
  name: string;
  fullName: string;
  department: string;
  logo: string;
  facultyCoordinator: {
    id: string;
    name: string;
    email: string;
    image?: string;
  } | null;
  admins: AdminUser[];
}

interface AdminAssignerProps {
  initialClubs: ClubItem[];
  onAdminAssigned?: () => void;
}

export default function AdminAssigner({
  initialClubs,
  onAdminAssigned,
}: AdminAssignerProps) {
  const [clubs, setClubs] = useState<ClubItem[]>(initialClubs);
  const [selectedClubId, setSelectedClubId] = useState<string>(
    initialClubs[0]?.id || ""
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [roleToAssign, setRoleToAssign] = useState<"club-admin" | "faculty-coordinator">(
    "club-admin"
  );

  // Action status
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const selectedClub = clubs.find((c) => c.id === selectedClubId) || clubs[0];

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const res = await fetch(`/api/super-admin/admins?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.users) {
        setSearchResults(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedClubId) return;

    try {
      setActionLoading(true);
      setMessage(null);

      const res = await fetch("/api/super-admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          clubId: selectedClubId,
          role: roleToAssign,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Assignment failed");

      setMessage({ type: "success", text: `Assigned ${selectedUser.name} as ${roleToAssign}` });

      // Refresh clubs
      const clubsRes = await fetch("/api/super-admin/admins");
      const clubsData = await clubsRes.json();
      if (clubsData.clubs) {
        setClubs(clubsData.clubs);
      }

      // Reset selection
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);

      if (onAdminAssigned) onAdminAssigned();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to assign" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!confirm("Are you sure you want to revoke this admin?")) return;

    try {
      setActionLoading(true);
      setMessage(null);

      const res = await fetch(
        `/api/super-admin/admins?userId=${userId}&clubId=${selectedClubId}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Revocation failed");

      setMessage({ type: "success", text: "Privileges revoked successfully" });

      // Refresh clubs
      const clubsRes = await fetch("/api/super-admin/admins");
      const clubsData = await clubsRes.json();
      if (clubsData.clubs) {
        setClubs(clubsData.clubs);
      }

      if (onAdminAssigned) onAdminAssigned();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to revoke" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-[#18181d] border border-[#26252e] rounded-[28px] p-6 space-y-6">
      
      {/* Top Header & Club Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#24232c]">
        <div>
          <h2 className="text-[17px] font-semibold text-[#f5f5fa]">
            Club Leadership Assigner
          </h2>
          <p className="text-[12px] text-[#787787] mt-0.5">
            Designate or revoke club-admins &amp; faculty coordinators for campus societies
          </p>
        </div>

        {/* Club Select Pill */}
        <div className="relative">
          <select
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="appearance-none bg-[#201f27] border border-[#2d2c38] text-[#e8e7f2] text-xs font-medium rounded-full pl-4 pr-9 py-2 outline-none cursor-pointer hover:border-[#3f3e4c] transition-colors"
          >
            {clubs.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#18181d] text-white">
                {c.name} ({c.department})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-[#888796] pointer-events-none" />
        </div>
      </div>

      {/* Alert banner if any */}
      {message && (
        <div
          className={`p-3 rounded-2xl flex items-center gap-2.5 text-xs ${
            message.type === "success"
              ? "bg-[#1c2921] border border-[#2d4435] text-[#9ae6b4]"
              : "bg-[#2d1b22] border border-[#482833] text-[#feb2b2]"
          }`}
        >
          {message.type === "success" ? (
            <Check className="h-4 w-4 shrink-0 text-[#68d391]" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-[#fc8181]" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Two Columns: Current Club Leadership vs Fast Assigner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Current Admins List for Selected Club */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-[#797887] uppercase">
              Current Leadership · {selectedClub?.name}
            </span>
            <span className="text-[11px] text-[#9b6883] font-medium bg-[#2a1d25] px-2.5 py-0.5 rounded-full border border-[#452c3b]">
              {selectedClub?.admins?.length || 0} Admins Active
            </span>
          </div>

          <div className="space-y-2">
            {(!selectedClub?.admins || selectedClub.admins.length === 0) ? (
              <div className="p-5 rounded-2xl border border-dashed border-[#282732] text-center text-xs text-[#6e6d7d]">
                No club-admins currently assigned to {selectedClub?.name}. Appoint one using the form.
              </div>
            ) : (
              selectedClub.admins.map((adm) => (
                <div
                  key={adm.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#1e1d24] border border-[#292834] hover:border-[#383745] transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {adm.image ? (
                      <Image
                        src={adm.image}
                        alt={adm.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover border border-[#3b3a4a]"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-[#34242f] border border-[#523347] flex items-center justify-center text-xs font-semibold text-[#f0cadf]">
                        {adm.name?.[0] || "U"}
                      </div>
                    )}
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#f0eff7] truncate">
                          {adm.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2c1d27] text-[#c983a5] border border-[#4a2e40] font-medium">
                          Club Admin
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7a7989] truncate">
                        {adm.email} {adm.department ? `· ${adm.department}` : ""}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevoke(adm.id)}
                    disabled={actionLoading}
                    className="p-2 text-[#797887] hover:text-[#ff9bb0] hover:bg-[#2b1c24] rounded-xl transition-colors"
                    title="Revoke Admin Access"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}

            {/* Faculty Coordinator Item */}
            <div className="pt-2">
              <span className="text-[10px] font-semibold text-[#6a6977] uppercase tracking-wider block mb-1.5">
                Faculty Coordinator
              </span>
              {selectedClub?.facultyCoordinator ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1e1d24] border border-[#292834]">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-9 w-9 rounded-full bg-[#24232c] border border-[#373544] flex items-center justify-center text-xs font-semibold text-[#c7c6d6]">
                      FC
                    </div>
                    <div className="truncate">
                      <span className="text-[13px] font-semibold text-[#f0eff7]">
                        {selectedClub.facultyCoordinator.name}
                      </span>
                      <p className="text-[11px] text-[#7a7989]">
                        {selectedClub.facultyCoordinator.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(selectedClub.facultyCoordinator!.id)}
                    disabled={actionLoading}
                    className="p-2 text-[#797887] hover:text-[#ff9bb0] hover:bg-[#2b1c24] rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-2xl border border-dashed border-[#282732] text-xs text-[#6e6d7d]">
                  No faculty coordinator assigned.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Form: Search Student & Appoint */}
        <div className="lg:col-span-5 bg-[#1b1a21] border border-[#282733] rounded-[24px] p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-[#797887] tracking-wider uppercase block mb-3">
              Appoint New Leader
            </span>

            {/* Role Switcher Pills */}
            <div className="flex items-center gap-2 bg-[#141318] p-1 rounded-full border border-[#26252f] mb-4">
              <button
                type="button"
                onClick={() => setRoleToAssign("club-admin")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all ${
                  roleToAssign === "club-admin"
                    ? "bg-[#6e465c] text-white shadow-sm"
                    : "text-[#868594] hover:text-white"
                }`}
              >
                Club Admin
              </button>
              <button
                type="button"
                onClick={() => setRoleToAssign("faculty-coordinator")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all ${
                  roleToAssign === "faculty-coordinator"
                    ? "bg-[#6e465c] text-white shadow-sm"
                    : "text-[#868594] hover:text-white"
                }`}
              >
                Faculty Coordinator
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#737280]" />
              <input
                type="text"
                placeholder="Search student by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-[#201f27] border border-[#2d2c38] rounded-full pl-9 pr-4 py-2.5 text-xs text-[#eae9f5] placeholder:text-[#6a6977] outline-none focus:border-[#4d4b5d] transition-colors"
              />
            </div>

            {/* Live Search Results */}
            {searchResults.length > 0 && !selectedUser && (
              <div className="max-h-44 overflow-y-auto custom-scrollbar space-y-1 mb-3 border border-[#292834] rounded-2xl p-1.5 bg-[#17161c]">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setSearchResults([]);
                    }}
                    className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-[#22212a] transition-colors"
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-semibold text-[#f0eff7] truncate">{u.name}</p>
                      <p className="text-[10px] text-[#7a7989] truncate">{u.email}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#282732] text-[#9d9cae] shrink-0">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected user preview */}
            {selectedUser && (
              <div className="p-3 rounded-2xl bg-[#281b23] border border-[#482c3c] flex items-center justify-between mb-2">
                <div className="truncate">
                  <p className="text-xs font-semibold text-[#f6d7e6] truncate">{selectedUser.name}</p>
                  <p className="text-[10px] text-[#b3859d] truncate">{selectedUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="p-1 hover:bg-[#3d2633] rounded-lg text-[#b3859d] hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={handleAssign}
            disabled={!selectedUser || actionLoading}
            className={`w-full py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              selectedUser && !actionLoading
                ? "bg-gradient-to-r from-[#6e465c] via-[#875571] to-[#6e465c] text-white hover:opacity-90 shadow-[0_4px_20px_rgba(110,70,92,0.4)]"
                : "bg-[#25242e] text-[#636270] cursor-not-allowed"
            }`}
          >
            {actionLoading ? "Assigning..." : `Appoint to ${selectedClub?.name}`}
          </button>
        </div>

      </div>
    </div>
  );
}
