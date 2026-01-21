"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RemoveMemberProps {
  groupId: string;
  userId: string;
  eventId: string;
  userName: string;
}

export default function RemoveMemberButton({
  groupId,
  userId,
  eventId,
  userName,
}: RemoveMemberProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    if (!confirm(`Remove ${userName} from the group?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/events/${eventId}/groups/${groupId}/members/${userId}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        const data = await res.json();

        // if not logged in
        if (res.status === 401) {
          router.push(
            `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
          );
          return;
        }

        // if not admin or is club-admin of other club
        if (res.status === 403) {
          router.replace("/forbidden");
          return;
        }

        //fallback
        toast.error(data.error);
        return;
      }

      toast.success(`Removed ${userName}!`);
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={isLoading}
      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all group/btn"
      title="Remove member"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <X className="w-4 h-4 opacity-0 group-hover:opacity-100 md:opacity-40" />
      )}
    </button>
  );
}
