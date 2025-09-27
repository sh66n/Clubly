"use client";
import React, { useState } from "react";
import UserCard from "./UserCard";
import GroupCard from "../Groups/GroupCard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import BorderedDiv from "../BorderedDiv";

interface WinnerAssignerProps {
  participants: any[]; // array of users or groups
  eventId: string;
  eventType: "individual" | "team";
  currentWinner?: any; // current winner user or group
}

export default function WinnerAssigner({
  participants,
  eventId,
  eventType,
  currentWinner,
}: WinnerAssignerProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const assignWinner = async (id: string) => {
    try {
      setLoadingId(id);

      const payload =
        eventType === "team"
          ? { winnerId: id } // group ID
          : { winnerId: id }; // user ID

      const res = await fetch(`/api/events/${eventId}/winners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign winner");

      toast.success("Winner assigned successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-20 h-fit p-4 space-y-6">
      {/* Current Winner Section */}
      {currentWinner && (
        <BorderedDiv className="p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Current Winner</h3>
          {eventType === "team" ? (
            <GroupCard group={currentWinner} />
          ) : (
            <UserCard user={currentWinner} />
          )}
        </BorderedDiv>
      )}

      {/* Participants Section */}
      <div className="space-y-4">
        {participants.map((p) => {
          // Skip rendering the current winner again
          if (currentWinner && p._id === currentWinner._id) return null;

          if (eventType === "team") {
            return (
              <div key={p._id} className="p-4 rounded-lg shadow-sm">
                <GroupCard group={p} />
                <button
                  className="mt-2 px-3 py-1 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
                  onClick={() => assignWinner(p._id)}
                  disabled={loadingId === p._id}
                >
                  {loadingId === p._id ? (
                    <LoaderCircle className="animate-spin w-4 h-4" />
                  ) : (
                    "Assign winner"
                  )}
                </button>
              </div>
            );
          } else {
            return (
              <UserCard
                key={p._id}
                user={p}
                action={
                  <button
                    className="px-3 py-1 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
                    onClick={() => assignWinner(p._id)}
                    disabled={loadingId === p._id}
                  >
                    {loadingId === p._id ? (
                      <LoaderCircle className="animate-spin w-4 h-4" />
                    ) : (
                      "Assign winner"
                    )}
                  </button>
                }
              />
            );
          }
        })}
      </div>
    </div>
  );
}
