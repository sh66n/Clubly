import AttendanceMarker from "@/components/Events/AttendanceMarker";
import UserCard from "@/components/Events/UserCard";
import { getAttendance } from "@/services/getAttendance";
import { getParticipants } from "@/services/getParticipants";
import { getPendingRegistrations } from "@/services/getPendingRegistrations";
import React from "react";

const getData = async (eventId) => {
  const participants = await getParticipants(eventId);
  const pendingRegistrations = await getPendingRegistrations(eventId);
  return { participants, pendingRegistrations };
};

export default async function Attendance({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const attendanceData = await getAttendance(eventId);

  const safeAttendanceData = attendanceData.map((u) => ({
    ...u,
    _id: u._id.toString(), // convert ObjectId → string
  }));

  const present = safeAttendanceData.filter((user) => user.present);
  const absent = safeAttendanceData.filter((user) => !user.present);

  return (
    <div className="h-full flex flex-col">
      <div className="text-3xl mb-4">Attendance</div>
      <AttendanceMarker present={present} absent={absent} eventId={eventId} />
      {/* <div>
        {pendingRegistrations.map((user, i) => (
          <UserCard key={user._id} user={user} />
        ))}
      </div> */}
    </div>
  );
}
