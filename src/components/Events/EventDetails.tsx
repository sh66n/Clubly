"use client";

import React from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { IEvent } from "@/models/event.schema";
import {
  Award,
  Building,
  Calendar,
  FileBadge,
  Trophy,
  User,
  Users,
} from "lucide-react";
import BorderedDiv from "../BorderedDiv";
import Link from "next/link";
import GroupCard from "../Groups/GroupCard";
import { useRouter } from "next/navigation";
import { IUser } from "@/models/user.schema";

interface EventDetailsProps {
  event: IEvent;
  group: any;
  user: IUser;
}

export default function EventDetails({
  event,
  group,
  user,
}: EventDetailsProps) {
  const today = new Date();
  const eventDate = new Date(event.date);
  const daysLeft = Math.max(differenceInCalendarDays(eventDate, today), 0);
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const payload: any = { eventId: event._id };
      if (event.eventType === "individual") {
        payload.userId = user.id;
      } else if (event.eventType === "team") {
        if (!group) {
          alert("You must join or create a group first.");
          return;
        }
        payload.groupId = group._id;
      }

      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Registration failed");

      alert("Registered successfully!");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ⛔ Disable register logic
  const isRegisterDisabled =
    event.eventType === "team" &&
    (!group || // No group
      user.id !== group.leader._id || // Not leader
      group.members.length < event.teamSize); // Team too small

  return (
    <div className="flex relative">
      <div className="w-[70%]">
        {/* Event Header */}
        <BorderedDiv className="p-4 mb-8">
          <div>
            <img
              src={event.organizingClub.logo}
              className="h-20 w-20 rounded-full border border-[#717171]"
              alt=""
            />
            <h1 className="text-3xl font-semibold my-4">{event.name}</h1>
            <div className="flex ml-auto items-center gap-2 text-[#717171] my-2">
              <Building />
              {event.organizingClub.name}
            </div>
            <div className="flex ml-auto items-center gap-2 text-[#717171]">
              <Trophy />₹{event.prize}
            </div>
          </div>
        </BorderedDiv>

        {/* Rewards */}
        <div className="mb-4">
          <h2 className="text-xl mb-2">Rewards and Prizes</h2>
          <BorderedDiv className="flex-1 flex flex-col gap-4 p-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                <Trophy />
              </div>
              ₹{event.prize}
            </div>

            {event.providesCertificate && (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                  <FileBadge />
                </div>
                Certificate
              </div>
            )}
          </BorderedDiv>
        </div>

        {/* Registration Deadline */}
        <div className="mb-4">
          <h2 className="text-xl mb-2">Registration Deadline</h2>
          <BorderedDiv className="flex-1 p-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                <Calendar />
              </div>
              {format(new Date(event.date), "PPP")}
            </div>
          </BorderedDiv>
        </div>

        {/* Details */}
        <div className="mb-4">
          <h2 className="text-xl mb-2">Details</h2>
          <BorderedDiv className="flex-1 p-4 whitespace-pre-line">
            <p>{event.description}</p>
          </BorderedDiv>
        </div>

        {/* Points */}
        <div className="mb-4">
          <h2 className="text-xl mb-2">Points</h2>
          <BorderedDiv className="flex-1 flex flex-col gap-4 p-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                <Award />
              </div>
              Participation: +10
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                <Award />
              </div>
              Winner: +50
            </div>
          </BorderedDiv>
        </div>
      </div>

      {/* Right side sticky card */}
      <div className="grow ml-4 pb-4">
        <div className="flex flex-col gap-4 sticky top-2">
          <BorderedDiv className="rounded-xl shadow-md p-4">
            <h2 className="font-semibold text-3xl mb-2">
              {event.registrationFee ? `₹${event.registrationFee}` : "Free"}
            </h2>

            <button
              onClick={handleRegister}
              disabled={isRegisterDisabled}
              className={`w-full py-2 rounded-lg font-semibold mb-2 ${
                isRegisterDisabled
                  ? "bg-[#000F57] opacity-50 cursor-not-allowed"
                  : "bg-[#000F57] text-white"
              }`}
            >
              Register
            </button>

            <div className="flex ml-auto items-center gap-2 text-[#717171] my-2">
              <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                {event.eventType === "individual" ? <User /> : <Users />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs">Team Size</span>
                <span className="text-sm">
                  {event.teamSize ? event.teamSize : "1"}
                </span>
              </div>
            </div>

            <div className="flex ml-auto items-center gap-2 text-[#717171] my-2">
              <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                <Calendar />
              </div>
              <div className="flex flex-col">
                <span className="text-xs">Registration Deadline</span>
                <span className="text-sm">{daysLeft} days left</span>
              </div>
            </div>
          </BorderedDiv>

          {event.eventType === "team" && (
            <>
              {group ? (
                <BorderedDiv>
                  <GroupCard group={group} isExpanded={true} />
                  {!group.isPublic && <div>Code: {group.joinCode}</div>}
                </BorderedDiv>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href={`/events/${event._id}/groups/new`}>
                    <BorderedDiv className="rounded-full text-center">
                      Create group
                    </BorderedDiv>
                  </Link>
                  <Link href={`/events/${event._id}/groups`}>
                    <BorderedDiv className="rounded-full text-center">
                      Join group
                    </BorderedDiv>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
