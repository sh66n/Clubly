"use client";
import React, { useState } from "react";
import UserCard from "./UserCard";
import AttendanceToggle from "./AttendanceToggle";
import GroupCard from "../Groups/GroupCard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function AttendanceMarker({
  present: initialPresent,
  absent: initialAbsent,
  eventId,
  eventType,
}) {
  const [present, setPresent] = useState(initialPresent);
  const [absent, setAbsent] = useState(initialAbsent);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = (id: string, makePresent: boolean) => {
    if (makePresent) {
      const item = absent.find((a) => a._id === id);
      if (item) {
        setAbsent(absent.filter((a) => a._id !== id));
        setPresent([...present, item]);
      }
    } else {
      const item = present.find((a) => a._id === id);
      if (item) {
        setPresent(present.filter((a) => a._id !== id));
        setAbsent([...absent, item]);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${eventId}/attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ present, absent }),
        },
      );
      if (!res.ok) throw new Error();
      toast.success("Changes saved");
      router.push(`/events/${eventId}`);
    } catch (error) {
      toast.error("Failed to sync");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full px-6 py-12 space-y-16 ">
      {/* List: Present */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
            Present
          </span>
          <div className="h-[1px] grow bg-gradient-to-r from-zinc-800 to-transparent" />
          <span className="text-[10px] font-mono text-zinc-600">
            {present.length}
          </span>
        </div>

        <div className="space-y-4">
          {present.map((entity) => (
            <div
              key={entity._id}
              className="flex items-center justify-between group transition-opacity duration-300"
            >
              <div className="flex-1">
                {eventType === "individual" ? (
                  <UserCard user={entity} />
                ) : (
                  <GroupCard group={entity} eventId={eventId} />
                )}
              </div>
              <div className="pl-4">
                <AttendanceToggle
                  isPresent={true}
                  onChange={(val) => handleToggle(entity._id, val)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* List: Absent */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
            Absent
          </span>
          <div className="h-[1px] grow bg-gradient-to-r from-zinc-900 to-transparent" />
          <span className="text-[10px] font-mono text-zinc-800">
            {absent.length}
          </span>
        </div>

        <div className="space-y-4 opacity-40 hover:opacity-100 transition-opacity duration-500">
          {absent.map((entity) => (
            <div
              key={entity._id}
              className="flex items-center justify-between group"
            >
              <div className="flex-1">
                {eventType === "individual" ? (
                  <UserCard user={entity} />
                ) : (
                  <GroupCard group={entity} eventId={eventId} />
                )}
              </div>
              <div className="pl-4">
                <AttendanceToggle
                  isPresent={false}
                  onChange={(val) => handleToggle(entity._id, val)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle Footer */}
      <div className="pt-10 flex justify-center">
        <button
          disabled={loading}
          onClick={handleSubmit}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-white border-b border-white pb-1 hover:text-zinc-400 hover:border-zinc-400 transition-all disabled:opacity-20"
        >
          {loading ? "Processing..." : "Sync Attendance"}
        </button>
      </div>
    </div>
  );
}
