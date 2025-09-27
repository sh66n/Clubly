"use client";
import React, { useState } from "react";
import UserCard from "./UserCard";
import AttendanceToggle from "./AttendanceToggle";
import GroupCard from "../Groups/GroupCard";
import BorderedDiv from "../BorderedDiv";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function AttendanceMarker({
  present: initialPresent,
  absent: initialAbsent,
  eventId,
  eventType,
}) {
  const [present, setPresent] = useState(initialPresent);
  const [absent, setAbsent] = useState(initialAbsent);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleToggle = (id: string, makePresent: boolean) => {
    if (makePresent) {
      // Move from absent → present
      const item = absent.find((a) => a._id === id);
      if (item) {
        setAbsent(absent.filter((a) => a._id !== id));
        setPresent([...present, item]);
      }
    } else {
      // Move from present → absent
      const item = present.find((a) => a._id === id);
      if (item) {
        setPresent(present.filter((a) => a._id !== id));
        setAbsent([...absent, item]);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
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
      toast.success("Attendance updated");
      router.push(`/events/${eventId}`);
    } catch (error) {
      toast.error("Error submitting attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grow flex flex-col">
      <div className="flex-1">
        {/* PRESENT */}
        <div className="min-h-20 h-fit p-4 space-y-2">
          <h3 className="font-semibold">Present</h3>
          {present.map((entity) =>
            eventType === "individual" ? (
              <UserCard
                key={entity._id}
                user={entity}
                action={
                  <AttendanceToggle
                    isPresent={true}
                    onChange={(makePresent) =>
                      handleToggle(entity._id, makePresent)
                    }
                  />
                }
              />
            ) : (
              <BorderedDiv key={entity._id} className="">
                <GroupCard group={entity} />
                <div className="mt-2 flex justify-center">
                  <span>
                    <AttendanceToggle
                      isPresent={true}
                      onChange={(makePresent) =>
                        handleToggle(entity._id, makePresent)
                      }
                    />
                  </span>
                </div>
              </BorderedDiv>
            )
          )}
        </div>

        {/* ABSENT */}
        <div className="min-h-30 h-fit p-4 space-y-2">
          <h3 className="font-semibold">Absent</h3>
          {absent.map((entity) =>
            eventType === "individual" ? (
              <UserCard
                key={entity._id}
                user={entity}
                action={
                  <AttendanceToggle
                    isPresent={false}
                    onChange={(makePresent) =>
                      handleToggle(entity._id, makePresent)
                    }
                  />
                }
              />
            ) : (
              <BorderedDiv key={entity._id}>
                <GroupCard group={entity} />
                <div className="mt-2 flex justify-center">
                  <span>
                    <AttendanceToggle
                      isPresent={false}
                      onChange={(makePresent) =>
                        handleToggle(entity._id, makePresent)
                      }
                    />
                  </span>
                </div>
              </BorderedDiv>
            )
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          disabled={loading}
          onClick={handleSubmit}
          className={`px-4 py-2 rounded-lg ${
            loading
              ? "bg-green-600 opacity-50 cursor-not-allowed"
              : "bg-green-600 hover:opacity-50 hover:cursor-pointer"
          }`}
        >
          {loading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            "Submit Attendance"
          )}
        </button>
      </div>
    </div>
  );
}
