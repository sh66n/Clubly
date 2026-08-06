"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LeaveGroupButton({
  eventId,
  groupId,
}: {
  eventId: string;
  groupId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/events/${eventId}/groups/${groupId}/leave`, {
        method: "POST",
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to leave group");

      toast.success("Left group successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLeave}
      disabled={isLoading}
      className="w-full py-2 text-sm text-red-500 hover:text-red-400 transition-colors flex items-center justify-center gap-2 group hover:bg-red-500/10 rounded-full hover:cursor-pointer disabled:opacity-50 border border-transparent hover:border-red-500/20"
    >
      <LogOut size={16} />
      {isLoading ? "Leaving..." : "Leave Group"}
    </button>
  );
}
