"use client";
import React from "react";
import UserCard from "./UserCard";

const assignWinner = async (userId: string, eventId: string) => {
  try {
    const res = await fetch(`/api/events/${eventId}/winners`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerIds: [userId] }), // overwrite with just one winner
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to assign winner");

    alert("✅ Winner assigned successfully!");
  } catch (err: any) {
    console.error("Error assigning winner:", err.message);
    alert("❌ Failed to assign winner");
  }
};

export default function WinnerAssigner({ participants, eventId }) {
  return (
    <div className="min-h-20 h-fit p-4 space-y-2">
      {participants.map((p, idx) => (
        <UserCard
          user={p}
          key={p._id}
          action={
            <button
              className="px-3 py-1 rounded-md text-sm font-medium"
              onClick={() => assignWinner(p._id, eventId)}
            >
              Assign winner
            </button>
          }
        />
      ))}
    </div>
  );
}
