import BackButton from "@/components/BackButton";
import AttendanceMarker from "@/components/Events/AttendanceMarker";
import UserCard from "@/components/Events/AttendanceUserCard";
import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models";
import { getAttendance } from "@/services/getAttendance";
import { getEventType } from "@/services/getEventType";
import { getParticipants } from "@/services/getParticipants";
import { getPendingRegistrations } from "@/services/getPendingRegistrations";
import React from "react";

export default async function Attendance({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const attendanceData = await getAttendance(eventId);
  const eventType = await getEventType(eventId);

  const safeAttendanceData = attendanceData.map((entity) => ({
    ...entity,
    _id: entity._id.toString(), // convert ObjectId → string
  }));

  const present = safeAttendanceData.filter((entity) => entity.present);
  const absent = safeAttendanceData.filter((entity) => !entity.present);

  return (
    <>
      <BackButton link={`/events/${eventId}`} />
      <div className="flex flex-col">
        <div className="text-3xl mb-2">Attendance</div>
        <div className="mb-8 text-[#717171]">
          Record attendance for participants{" "}
        </div>

        <AttendanceMarker
          present={present}
          absent={absent}
          eventId={eventId}
          eventType={eventType} // pass event type
        />
      </div>
    </>
  );
}
