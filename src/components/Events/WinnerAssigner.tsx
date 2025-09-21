"use client";
import React from "react";
import UserCard from "./UserCard";
import GroupCard from "../Groups/GroupCard";

const assignWinner = async (ids: string[], eventId: string) => {
  try {
    const res = await fetch(`/api/events/${eventId}/winners`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerIds: ids }), // send array of user IDs
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to assign winner");

    alert("✅ Winner assigned successfully!");
  } catch (err: any) {
    console.error("Error assigning winner:", err.message);
    alert("❌ Failed to assign winner");
  }
};

interface WinnerAssignerProps {
  participants: any[]; // array of users or groups
  eventId: string;
  eventType: "individual" | "team";
}

export default function WinnerAssigner({
  participants,
  eventId,
  eventType,
}: WinnerAssignerProps) {
  return (
    <div className="min-h-20 h-fit p-4 space-y-4">
      {participants.map((p) => {
        if (eventType === "team") {
          // Render group card
          return (
            <div key={p._id} className="p-4 rounded-lg shadow-sm">
              <GroupCard group={p} />
              <button
                className="mt-2 px-3 py-1 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                onClick={() =>
                  assignWinner(
                    p.members.map((m: any) => m._id), // send all member IDs
                    eventId
                  )
                }
              >
                Assign winner
              </button>
            </div>
          );
        } else {
          // Render individual user
          return (
            <UserCard
              key={p._id}
              user={p}
              action={
                <button
                  className="px-3 py-1 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                  onClick={() => assignWinner([p._id], eventId)}
                >
                  Assign winner
                </button>
              }
            />
          );
        }
      })}
    </div>
  );
}
