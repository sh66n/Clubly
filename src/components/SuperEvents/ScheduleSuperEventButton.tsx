import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ScheduleSuperEventButton() {
  return (
    <button className="bg-white text-black rounded-full w-fit">
      <Link href={"/superevents/new"} className="flex items-center p-2">
        <Plus />
        Schedule Super Event
      </Link>
    </button>
  );
}
