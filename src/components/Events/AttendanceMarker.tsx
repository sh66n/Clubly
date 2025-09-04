"use client";
import React, { useState } from "react";
import UserCard from "./UserCard";
import { assignPoints } from "@/services/assignPoints";

export default function AttendanceMarker({
  present: initialPresent,
  absent: initialAbsent,
  eventId,
}) {
  const [present, setPresent] = useState(initialPresent);
  const [absent, setAbsent] = useState(initialAbsent);

  const handleToggle = (userId: string, makePresent: boolean) => {
    if (makePresent) {
      // Move from absent → present
      const user = absent.find((u) => u._id === userId);
      if (user) {
        setAbsent(absent.filter((u) => u._id !== userId));
        setPresent([...present, user]);
      }
    } else {
      // Move from present → absent
      const user = present.find((u) => u._id === userId);
      if (user) {
        setPresent(present.filter((u) => u._id !== userId));
        setAbsent([...absent, user]);
      }
    }
  };

  const handleSubmit = async () => {
    console.log("Present:", present);
    console.log("Absent:", absent);
    // send present/absent arrays to API here
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${eventId}/attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ present, absent }),
        }
      );
      if (!res.ok) throw new Error("Failed to update attendance");
      const updatedEvent = await res.json();

      console.log("✅ Attendance updated:", updatedEvent);
    } catch (error) {
      console.error("❌ Error submitting attendance:", error);
    }
  };

  return (
    <div className="grow flex flex-col">
      <div className="flex-1">
        <div className="min-h-1/2 h-fit p-4 space-y-2">
          Present
          {present.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              isPresent={true}
              onToggle={handleToggle}
            />
          ))}
        </div>

        <div className="min-h-1/2 h-fit p-4 space-y-2 ">
          Absent
          {absent.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              isPresent={false}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Submit Attendance
        </button>
      </div>
    </div>
  );
}
