"use client";
import React, { useState } from "react";
import UserCard from "./UserCard";
import GroupCard from "../Groups/GroupCard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trophy, Users } from "lucide-react";

interface WinnerAssignerProps {
  participants: any[];
  eventId: string;
  eventType: "individual" | "team";
  currentWinner?: any;
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
      const res = await fetch(`/api/events/${eventId}/winners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: id }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push(
            `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
          );
          return;
        }
        if (res.status === 403) {
          router.replace("/forbidden");
          return;
        }
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      toast.success("Winner assigned");
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to assign winner");
    } finally {
      setLoadingId(null);
    }
  };

  const AssignButton = ({ id }: { id: string }) => (
    <button
      onClick={() => assignWinner(id)}
      disabled={loadingId !== null}
      className="group flex items-center gap-2 px-3 py-1.5 transition-all"
    >
      {loadingId === id ? (
        <LoaderCircle className="animate-spin text-zinc-500" size={14} />
      ) : (
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-emerald-500 transition-colors">
          Assign Winner
        </span>
      )}
    </button>
  );

  return (
    <div className="max-w-xl mx-auto w-full px-6 py-12 space-y-16">
      {/* SECTION: CURRENT WINNER */}
      {currentWinner && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Trophy size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
              Current Champion
            </span>
            <div className="h-[1px] grow bg-gradient-to-r from-amber-500/20 to-transparent" />
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 to-transparent blur-lg opacity-50" />
            <div className="relative">
              {eventType === "team" ? (
                <GroupCard group={currentWinner} eventId={eventId} />
              ) : (
                <UserCard user={currentWinner} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: PARTICIPANTS */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Users size={14} className="text-zinc-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
            Participants
          </span>
          <div className="h-[1px] grow bg-gradient-to-r from-zinc-900 to-transparent" />
        </div>

        <div className="space-y-2">
          {participants.map((p) => {
            if (currentWinner && p._id === currentWinner._id) return null;

            return (
              <div key={p._id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between group">
                  <div className="flex-1">
                    {eventType === "team" ? (
                      <GroupCard group={p} eventId={eventId} />
                    ) : (
                      <UserCard user={p} action={<AssignButton id={p._id} />} />
                    )}
                  </div>
                </div>

                {/* Dedicated button row for Team view since GroupCard is large */}
                {eventType === "team" && (
                  <div className="flex justify-end pr-2">
                    <AssignButton id={p._id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
