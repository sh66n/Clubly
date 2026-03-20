import React from "react";
import BorderedDiv from "../BorderedDiv";
import { IEvent } from "@/models/event.schema";
import UserCard from "./UserCard";
import GroupCard from "../Groups/GroupCard"; // ✅ import group card
import { Calendar, Crown } from "lucide-react";
import Link from "next/link";
import DownloadAttendance from "./DownloadAttendance";
import CloseRegistrationToggle from "./CloseRegistrationToggle";

interface EventInsightsProps {
  event: IEvent;
}

export default function EventInsights({ event }: EventInsightsProps) {
  const isTeam = event.eventType === "team";

  return (
    <>
      <h2 className="text-xl mb-2">Event Insights</h2>
      <BorderedDiv className="">
        <div className="flex md:flex-row flex-col gap-4">
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

          <DownloadAttendance
            eventId={event._id.toString()}
            eventName={event.name}
          />

          <CloseRegistrationToggle
            eventId={event._id.toString()}
            initialStatus={event.isRegistrationOpen ?? true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Registrations */}
          <div className="flex-1">
            <div className="text-lg mb-4">Registrations</div>
            <div className="flex flex-col gap-2">
              {isTeam ? (
                (event as any).registeredGroups?.length > 0 ? (
                  (event as any).registeredGroups.map((g: any) => (
                    <GroupCard group={g} eventId={event._id.toString()} key={g._id.toString()} />
                  ))
                ) : (
                  <div className="text-sm text-[#717171]">None yet</div>
                )
              ) : (event as any).registeredUsers?.length > 0 ? (
                (event as any).registeredUsers.map((u: any) => (
                  <UserCard user={u} key={u._id.toString()} />
                ))
              ) : (
                <div className="text-sm text-[#717171]">None yet</div>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="flex-1">
            <div className="text-lg mb-4">Participants</div>
            <div className="flex flex-col gap-2">
              {isTeam ? (
                (event as any).attendedGroups?.length > 0 ? (
                  (event as any).attendedGroups.map((g: any) => (
                    <GroupCard group={g} eventId={event._id.toString()} key={g._id.toString()} />
                  ))
                ) : (
                  <div className="text-sm text-[#717171]">None yet</div>
                )
              ) : (event as any).attendedUsers?.length > 0 ? (
                (event as any).attendedUsers.map((u: any) => <UserCard user={u} key={u._id.toString()} />)
              ) : (
                <div className="text-sm text-[#717171]">None yet</div>
              )}
            </div>
          </div>

          {/* Winners */}
          <div className="flex-1">
            <div className="text-lg mb-4">Winners</div>
            <div className="flex flex-col gap-2">
              {isTeam ? (
                event.winnerGroup ? (
                  <GroupCard
                    group={event.winnerGroup as any}
                    eventId={event._id.toString()}
                    key={(event.winnerGroup as any)._id?.toString()}
                  />
                ) : (
                  <div className="text-sm text-[#717171]">None yet</div>
                )
              ) : event.winner ? (
                <UserCard user={event.winner as any} key={(event.winner as any)._id?.toString()} />
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
