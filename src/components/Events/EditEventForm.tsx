"use client";

import { Session } from "next-auth";
import { useState } from "react";
import Input from "../Input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BackButton from "../BackButton";
import { IEvent } from "@/models/event.schema";

interface EditEventFormProps {
  user: Session["user"];
  event: IEvent;
}

export default function EditEventForm({ user, event }: EditEventFormProps) {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [file, setFile] = useState<File | null>(null);
  const [eventType, setEventType] = useState<"individual" | "team">(
    event.eventType,
  );
  const [loading, setLoading] = useState(false);
  const [teamSizeMode, setTeamSizeMode] = useState<"fixed" | "range">(
    event.teamSizeRange ? "range" : "fixed",
  );

  const d = new Date(event.date);

  // Force IST extraction
  const istTime = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const defaultTime = istTime;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (eventType === "individual") {
      formData.set("teamSize", "1");
      formData.delete("teamSizeRange[min]");
      formData.delete("teamSizeRange[max]");
    }

    if (eventType === "team") {
      if (teamSizeMode === "fixed") {
        formData.delete("teamSizeRange[min]");
        formData.delete("teamSizeRange[max]");
      }

      if (teamSizeMode === "range") {
        formData.delete("teamSize");
      }
    }

    if (file) {
      formData.append("image", file);
    }

    try {
      const res = await fetch(`/api/events/${event._id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();

        // if not logged in
        if (res.status === 401) {
          router.push(
            `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
          );
          return;
        }

        // if not admin or is club-admin of other club
        if (res.status === 403) {
          router.replace("/forbidden");
          return;
        }

        //fallback
        toast.error(data.error);
        return;
      }

      toast.success("Event updated successfully");
      router.push(`/events/${event._id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackButton link={`/events/${event._id}`} />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-6 bg-black border border-[#515151] text-white rounded-2xl"
      >
        {/* Event Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Event Name</label>
          <Input name="name" defaultValue={event.name} required />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Description</label>
          <textarea
            name="description"
            defaultValue={event.description}
            className="h-40 rounded-xl border border-gray-700 px-4 py-2 bg-gray-800 text-gray-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Date</label>
          <Input
            type="date"
            name="date"
            defaultValue={event.date.split("T")[0]}
            required
          />
        </div>

        {/* Time */}
        <div className="flex flex-col gap-1 max-w-xs">
          <label className="text-sm font-medium text-gray-300">Time</label>
          <Input
            type="time"
            name="eventTime"
            defaultValue={defaultTime}
            required
          />
        </div>

        {/* Event Type */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Event Type</label>
          <select
            name="eventType"
            value={eventType}
            onChange={(e) =>
              setEventType(e.target.value as "individual" | "team")
            }
            className="max-w-xs rounded-xl border border-gray-700 px-4 py-2 bg-gray-800"
          >
            <option value="individual">Individual</option>
            <option value="team">Team</option>
          </select>
        </div>

        {/* Team Size */}
        {eventType === "team" && (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-300">
              Team Size
            </label>

            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={teamSizeMode === "fixed"}
                  onChange={() => setTeamSizeMode("fixed")}
                />
                Fixed
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={teamSizeMode === "range"}
                  onChange={() => setTeamSizeMode("range")}
                />
                Range
              </label>
            </div>

            {teamSizeMode === "fixed" && (
              <Input
                type="number"
                name="teamSize"
                min={1}
                defaultValue={event.teamSize}
                placeholder="Exact team size"
                required
              />
            )}

            {teamSizeMode === "range" && (
              <div className="flex gap-3 max-w-xs">
                <Input
                  type="number"
                  name="teamSizeRange[min]"
                  min={1}
                  defaultValue={event.teamSizeRange?.min}
                  placeholder="Min"
                  required
                />
                <Input
                  type="number"
                  name="teamSizeRange[max]"
                  min={1}
                  defaultValue={event.teamSizeRange?.max}
                  placeholder="Max"
                  required
                />
              </div>
            )}
          </div>
        )}

        {/* Prize */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Prize</label>
          <Input type="number" name="prize" defaultValue={event.prize} />
        </div>

        {/* Certificate */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Provides Certificate?</label>
          <select
            name="providesCertificate"
            defaultValue={String(event.providesCertificate)}
            className="max-w-xs rounded-xl border border-gray-700 px-4 py-2 bg-gray-800"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Registration Fee */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Registration Fee</label>
          <Input
            type="number"
            name="registrationFee"
            defaultValue={event.registrationFee}
          />
        </div>

        {/* Max Registrations */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Max Registrations</label>
          <Input
            type="number"
            name="maxRegistrations"
            defaultValue={event.maxRegistrations}
          />
        </div>

        {/* Image */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Update Event Banner</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-xl border border-gray-700 p-3 bg-gray-800"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 py-2 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Updating..." : "Update Event"}
        </button>
      </form>
    </>
  );
}
