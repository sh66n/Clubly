import AttendanceMarker from "@/components/Events/AttendanceMarker";
import UserCard from "@/components/Events/AttendanceUserCard";
import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models";
import { getAttendance } from "@/services/getAttendance";
import { getParticipants } from "@/services/getParticipants";
import { getPendingRegistrations } from "@/services/getPendingRegistrations";
import React from "react";

const getEvent = async (eventId: string) => {
  await connectToDb();
  const event = await Event.findById(eventId).select("eventType");
  if (!event) throw new Error("Event not found");

  return event.eventType;
};

export default async function Attendance({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const attendanceData = await getAttendance(eventId);
  const eventType = await getEvent(eventId);

  const safeAttendanceData = attendanceData.map((entrant) => ({
    ...entrant,
    _id: entrant._id.toString(), // convert ObjectId → string
  }));

  const present = safeAttendanceData.filter((entrant) => entrant.present);
  const absent = safeAttendanceData.filter((entrant) => !entrant.present);

  return (
    <div className="h-full flex flex-col">
      <div className="text-3xl mb-4">Attendance</div>
      <AttendanceMarker
        present={present}
        absent={absent}
        eventId={eventId}
        eventType={eventType} // pass event type
      />
    </div>
  );
}
