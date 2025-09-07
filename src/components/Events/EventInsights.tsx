import React from "react";
import BorderedDiv from "../BorderedDiv";
import { IEvent } from "@/models/event.schema";
import UserCard from "./UserCard";
import { Calendar, Crown, Divide } from "lucide-react";
import Link from "next/link";

interface EventInsightsProps {
  event: IEvent;
}

export default function EventInsights({ event }: EventInsightsProps) {
  return (
    <>
      <h2 className="text-xl mb-2">Event Insights</h2>
      <BorderedDiv className="">
        <div className="flex gap-4">
          <Link
            className="flex items-center gap-2 mb-4 w-fit hover:opacity-80"
            href={`/events/${event._id}/attendance`}
          >
            <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
              <Calendar />
            </div>
            View Attendance
          </Link>

          <Link
            className="flex items-center gap-2 mb-4 w-fit hover:opacity-80"
            href={`/events/${event._id}/assign-winner`}
          >
            <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
              <Crown />
            </div>
            Assign Winner
          </Link>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <div className="text-lg mb-4">Registrations</div>
            <div className="flex flex-col gap-2">
              {event.registrations.length > 0 ? (
                event.registrations.map((u) => (
                  <UserCard user={u} key={u._id} />
                ))
              ) : (
                <div className="text-sm text-[#717171]">None yet</div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-lg mb-4 ">Participants</div>
            <div className="flex flex-col gap-2">
              {event.participants.length > 0 ? (
                event.participants.map((u) => <UserCard user={u} key={u._id} />)
              ) : (
                <div className="text-sm text-[#717171]">None yet</div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-lg mb-4 ">Winners</div>
            <div className="flex flex-col gap-2">
              {event.winners.length > 0 ? (
                event.winners.map((u) => <UserCard user={u} key={u._id} />)
              ) : (
                <div className="text-sm text-[#717171]">None yet</div>
              )}
            </div>
          </div>
        </div>
      </BorderedDiv>
    </>
  );
}
