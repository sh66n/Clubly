import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ScheduleEventButton() {
  return (
    <button className="bg-white text-black  rounded-full">
      <Link href={"/events/new"} className="flex p-2">
        <Plus />
        Schedule Event
      </Link>
    </button>
  );
}
