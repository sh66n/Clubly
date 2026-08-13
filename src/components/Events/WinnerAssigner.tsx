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
  currentWinners?: { participant: any; position: number }[];
  numberOfWinners: number;
}

export default function WinnerAssigner({
  participants,
  eventId,
  eventType,
  currentWinners = [],
  numberOfWinners = 1,
}: WinnerAssignerProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const assignWinner = async (id: string, position: number) => {
    try {
      setLoadingId(`${id}-${position}`);
      const res = await fetch(`/api/events/${eventId}/winners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: id, position }),
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

      toast.success(`Winner assigned for position ${position}`);
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to assign winner");
    } finally {
      setLoadingId(null);
    }
  };

  const AssignButtons = ({ id }: { id: string }) => (
    <div className="flex gap-2">
      {Array.from({ length: numberOfWinners }).map((_, idx) => {
        const pos = idx + 1;
        const isLoading = loadingId === `${id}-${pos}`;
        
        let label = "1st Place";
        if (pos === 2) label = "2nd Place";
        if (pos === 3) label = "3rd Place";

        return (
          <button
            key={pos}
            onClick={() => assignWinner(id, pos)}
            disabled={loadingId !== null}
            className="group flex items-center gap-1 px-2 py-1.5 transition-all border border-zinc-800 rounded hover:bg-zinc-800"
          >
            {isLoading ? (
              <LoaderCircle className="animate-spin text-zinc-500" size={14} />
            ) : (
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400 group-hover:text-amber-500 transition-colors">
                {label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const getPositionLabel = (pos: number) => {
    if (pos === 1) return "1st Place Champion";
    if (pos === 2) return "2nd Place Runner-Up";
    if (pos === 3) return "3rd Place";
    return "Champion";
  };

  const getPositionColor = (pos: number) => {
    if (pos === 1) return "text-amber-500";
    if (pos === 2) return "text-gray-300";
    if (pos === 3) return "text-orange-500";
    return "text-amber-500";
  };

  const getGradientFrom = (pos: number) => {
    if (pos === 1) return "from-amber-500/20";
    if (pos === 2) return "from-gray-300/20";
    if (pos === 3) return "from-orange-500/20";
    return "from-amber-500/20";
  };

  return (
    <div className="max-w-xl mx-auto w-full px-6 py-12 space-y-16">
      {/* SECTION: CURRENT WINNERS */}
      {currentWinners.length > 0 && (
        <div className="space-y-10">
          {currentWinners.sort((a, b) => a.position - b.position).map((w, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-4">
                <Trophy size={14} className={getPositionColor(w.position)} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                  {getPositionLabel(w.position)}
                </span>
                <div className={`h-[1px] grow bg-gradient-to-r ${getGradientFrom(w.position)} to-transparent`} />
              </div>

              <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r ${getGradientFrom(w.position)} to-transparent blur-lg opacity-50`} />
                <div className="relative">
                  {eventType === "team" ? (
                    <GroupCard group={w.participant} eventId={eventId} />
                  ) : (
                    <UserCard user={w.participant} />
                  )}
                </div>
              </div>
            </div>
          ))}
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

        <div className="space-y-4">
          {participants.map((p) => {
            // Don't show if they are already a winner
            if (currentWinners.some((w) => w.participant._id === p._id)) return null;

            return (
              <div key={p._id} className="flex flex-col gap-2 p-3 border border-zinc-800/50 rounded-xl">
                <div className="flex items-center justify-between group">
                  <div className="flex-1">
                    {eventType === "team" ? (
                      <GroupCard group={p} eventId={eventId} />
                    ) : (
                      <UserCard user={p} />
                    )}
                  </div>
                </div>

                <div className="flex justify-end pr-2 pt-2 border-t border-zinc-800/50">
                  <AssignButtons id={p._id} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
