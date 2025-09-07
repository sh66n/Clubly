"use client";

import React from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { IEvent } from "@/models/event.schema";
import {
  Award,
  Building,
  Calendar,
  Divide,
  FileBadge,
  Trophy,
  User,
  Users,
} from "lucide-react";
import BorderedDiv from "../BorderedDiv";

interface EventDetailsProps {
  event: IEvent;
}

export default function EventDetails({ event }: EventDetailsProps) {
  const today = new Date();
  const eventDate = new Date(event.date); // assuming event.date is the registration deadline
  const daysLeft = Math.max(differenceInCalendarDays(eventDate, today), 0);

  return (
    <>
      <div className="flex relative">
        <div className="w-[70%]">
          {/* Header */}
          <BorderedDiv className="p-4 mb-8">
            <div className="">
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

          <div className="mb-4">
            <h2 className="text-xl mb-2">Details</h2>
            <BorderedDiv className="flex-1 p-4 whitespace-pre-line">
              <p>{event.description}</p>
              {/* <div className="h-[2000px]" /> just for scroll testing */}
            </BorderedDiv>
          </div>

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

        {/* Content + Sticky Card */}
        <div className="grow ml-4 pb-4">
          {/* Sticky Card */}
          <div className="flex flex-col gap-4 sticky top-2">
            <BorderedDiv className="rounded-xl shadow-md p-4">
              <h2 className="font-semibold text-3xl mb-2">
                {event.registrationFee ? `₹${event.registrationFee}` : "Free"}
              </h2>
              <button className="w-full bg-[#000F57] text-white py-2 rounded-lg font-semibold mb-2">
                Register
              </button>
              <div className="flex ml-auto items-center gap-2 text-[#717171] my-2">
                <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                  {event.eventType === "individual" ? (
                    <User className=" " />
                  ) : (
                    <Users className="" />
                  )}
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
            <BorderedDiv>
              <h2 className="font-semibold text-2xl mb-2">My group</h2>
            </BorderedDiv>
          </div>
        </div>
      </div>
    </>
  );
}
