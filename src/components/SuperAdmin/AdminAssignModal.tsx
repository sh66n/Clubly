"use client";

import React, { useState } from "react";
import {
  Search,
  Check,
  ChevronDown,
  X,
  Trash2,
  UserPlus,
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

interface AdminAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubs: ClubItem[];
  onAdminAssigned?: () => void;
}

export default function AdminAssignModal({
  isOpen,
  onClose,
  clubs,
  onAdminAssigned,
}: AdminAssignModalProps) {
  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [roleToAssign, setRoleToAssign] = useState<"club-admin" | "faculty-coordinator">(
    "club-admin"
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#18181d] border border-[#2d2c38] rounded-[28px] p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24232c]">
          <div>
            <h3 className="text-[17px] font-semibold text-[#f5f5fa]">
              Assign Club Leadership
            </h3>
            <p className="text-[12px] text-[#787787] mt-0.5">
              Appoint club-admins or faculty coordinators
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#201f27] text-[#8e8d9e] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-3 rounded-2xl flex items-center gap-2 text-xs ${
              message.type === "success"
                ? "bg-[#1c2921] border border-[#2d4435] text-[#9ae6b4]"
                : "bg-[#2d1b22] border border-[#482833] text-[#feb2b2]"
            }`}
          >
            <span>{message.text}</span>
          </div>
        )}

        {/* Club Selection */}
        <div>
          <label className="text-[11px] font-medium text-[#7a7989] block mb-1.5">
            Select Club
          </label>
          <div className="relative">
            <select
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              className="w-full appearance-none bg-[#201f27] border border-[#2d2c38] text-[#e8e7f2] text-xs font-medium rounded-full pl-4 pr-9 py-2.5 outline-none cursor-pointer hover:border-[#3f3e4c]"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#18181d] text-white">
                  {c.name} ({c.department})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-3 h-3.5 w-3.5 text-[#888796] pointer-events-none" />
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label className="text-[11px] font-medium text-[#7a7989] block mb-1.5">
            Target Role
          </label>
          <div className="flex items-center gap-2 bg-[#141318] p-1 rounded-full border border-[#26252f]">
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
        </div>

        {/* Search Student */}
        <div>
          <label className="text-[11px] font-medium text-[#7a7989] block mb-1.5">
            Search Student
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#737280]" />
            <input
              type="text"
              placeholder="Search student by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-[#201f27] border border-[#2d2c38] rounded-full pl-9 pr-4 py-2.5 text-xs text-[#eae9f5] placeholder:text-[#6a6977] outline-none focus:border-[#4d4b5d]"
            />
          </div>

          {/* Results List */}
          {searchResults.length > 0 && !selectedUser && (
            <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 mt-2 border border-[#292834] rounded-2xl p-1.5 bg-[#17161c]">
              {searchResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setSelectedUser(u);
                    setSearchResults([]);
                  }}
                  className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-[#22212a]"
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

          {selectedUser && (
            <div className="p-3 rounded-2xl bg-[#281b23] border border-[#482c3c] flex items-center justify-between mt-2">
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

        {/* Action Button */}
        <div className="pt-2">
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
