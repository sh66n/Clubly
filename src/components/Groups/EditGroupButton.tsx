"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";

export default function EditGroupButton({
  eventId,
  groupId,
}: {
  eventId: string;
  groupId: string;
}) {
  return (
    <Link
      href={`/events/${eventId}/groups/${groupId}/edit`}
      className="
        w-fit inline-flex items-center gap-2 px-4 py-2 rounded-lg border
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
      <Pencil size={14} className="text-zinc-500" />
      Edit Group
    </Link>
  );
}
