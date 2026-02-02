"use client";

import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function DisbandGroupButton({
  eventId,
  groupId,
}: {
  eventId: string;
  groupId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDisband = async () => {
    const confirmed = confirm(
      "Are you sure you want to disband this group? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/events/${eventId}/groups/${groupId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to disband group");
      }

      router.push(`/events/${eventId}/groups`);
      router.refresh();
    } catch (err) {
      alert("Something went wrong while disbanding the group.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDisband}
      disabled={loading}
      className="
        w-fit hover:cursor-pointer disbaled:cursor-not-allowed
        inline-flex items-center gap-2 px-4 py-2 rounded-lg border
        text-sm font-medium transition-all
        /* Colors: Clean and Professional */
        bg-white border-zinc-200 text-zinc-700
        hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-sm
        /* Dark Mode */
        dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300
        dark:hover:bg-zinc-800 dark:hover:border-zinc-700
        /* Feedback */
        active:scale-[0.98]
      "
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Trash2 size={14} />
      )}
      {loading ? "Disbanding..." : "Disband Group"}
    </button>
  );
}
