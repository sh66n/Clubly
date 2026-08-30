"use client";

import React, { useState, useEffect } from "react";
import { Handshake, Plus, Check, Loader2, X, Building, Send } from "lucide-react";
import { toast } from "sonner";

interface CollabSectionProps {
  entityType: "event" | "superevent" | "hackathon";
  entityId: string;
  organizingClubId: string;
  collaboratingClubs?: any[];
  onUpdate?: () => void;
}

export default function CollabSection({
  entityType,
  entityId,
  organizingClubId,
  collaboratingClubs = [],
  onUpdate,
}: CollabSectionProps) {
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await fetch("/api/clubs");
        if (res.ok) {
          const data = await res.json();
          // Filter out the primary organizing club
          const available = data.filter((c: any) => c._id !== organizingClubId);
          setClubs(available);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClubs();
  }, [organizingClubId]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubId) {
      toast.error("Please select a club to collaborate with");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/club-admin/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          targetClubId: selectedClubId,
          message: message.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send collaboration invite");
      }

      toast.success("Collaboration invitation sent to club!");
      setSelectedClubId("");
      setMessage("");
      setIsFormOpen(false);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Handshake size={18} className="text-[#7CB342]" /> Club Collaborations
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Invite other college clubs to co-host this {entityType}. Co-hosts get shared analytics and are listed publicly.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7CB342]/10 text-[#7CB342] hover:bg-[#7CB342] hover:text-white rounded-xl text-xs font-bold transition"
        >
          {isFormOpen ? <X size={14} /> : <Plus size={14} />}
          <span>{isFormOpen ? "Cancel" : "Invite Partner Club"}</span>
        </button>
      </div>

      {/* Active Collaborators */}
      {collaboratingClubs && collaboratingClubs.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Confirmed Co-Hosting Clubs ({collaboratingClubs.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {collaboratingClubs.map((club: any) => (
              <div
                key={club._id || club}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                  {club.logo ? (
                    <img src={club.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building size={16} className="text-slate-400" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {club.name || "Club Partner"}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check size={10} /> Active Co-Host
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 text-center">
          No partner clubs co-hosting yet. Invite a club below to collaborate!
        </div>
      )}

      {/* Invite Form */}
      {isFormOpen && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 pt-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Send Collaboration Invitation
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Select Partner Club <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]"
              required
            >
              <option value="">-- Choose a Club --</option>
              {clubs.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Invitation Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Let's collaborate on this event and co-host it together!"
              rows={2}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSendInvite}
              disabled={loading || !selectedClubId}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#7CB342] text-white text-xs font-bold rounded-xl hover:bg-[#689f38] transition disabled:opacity-50 shadow-sm"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              <span>Send Invitation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
