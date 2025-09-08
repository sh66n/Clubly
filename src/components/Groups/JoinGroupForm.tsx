"use client";

import React, { useState } from "react";

export default function JoinGroupForm({ eventId, group }) {
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(
        `/api/events/${eventId}/groups/${group._id}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            group.isPublic ? {} : { joinCode } // ✅ only send joinCode if needed
          ),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join group");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-4">
        {!group.isPublic && (
          <input
            type="text"
            name="joinCode"
            placeholder="Enter join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#000F57]"
            required
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-[#000F57] text-white font-medium disabled:opacity-50"
        >
          {loading ? "Joining..." : "Join Group"}
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">Successfully joined!</p>}
    </form>
  );
}
