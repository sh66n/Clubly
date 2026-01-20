"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Loader2, LockOpen, Hash } from "lucide-react";

export default function JoinGroupForm({ eventId, group }) {
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `/api/events/${eventId}/groups/${group._id}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(group.isPublic ? {} : { joinCode }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join group");
      }

      toast.success(`Successfully joined ${group.name}`);
      router.refresh(); // Refresh current page data
      router.push(`/events/${eventId}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3">
        {/* Helper Label */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            {group.isPublic ? "Instant Access" : "Authorization Required"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {!group.isPublic && (
            <div className="relative flex-1 group">
              <Hash
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-white transition-colors"
              />
              <input
                type="text"
                placeholder="Enter join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-2xl outline-none focus:border-white transition-all placeholder:text-gray-700 font-mono tracking-widest"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!group.isPublic && !joinCode.trim())}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed
              ${
                group.isPublic
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-white text-black hover:bg-gray-200"
              } ${!group.isPublic && "sm:w-fit"}`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>{group.isPublic ? "Join Public Group" : "Join"}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {/* Subtle hint */}
        <p className="text-[10px] text-gray-600 px-1">
          {group.isPublic
            ? "Click to join this team immediately."
            : "Private groups require a 6-character code from the leader."}
        </p>
      </div>
    </form>
  );
}
