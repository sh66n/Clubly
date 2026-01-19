"use client";

import { Session } from "next-auth";
import { useState } from "react";
import Input from "../Input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BackButton from "../BackButton";

interface EditEventFormProps {
  user: Session["user"];
  event: {
    _id: string;
    name: string;
    description?: string;
    date: string;
    eventType: "individual" | "team";
    teamSize?: number;
    prize?: number;
    providesCertificate: boolean;
    registrationFee?: number;
    maxRegistrations?: number;
    image?: string;
  };
}

export default function EditEventForm({ user, event }: EditEventFormProps) {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [file, setFile] = useState<File | null>(null);
  const [eventType, setEventType] = useState<"individual" | "team">(
    event.eventType,
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (eventType === "individual") {
      formData.set("teamSize", "1");
    }

    if (file) {
      formData.append("image", file);
    }

    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, {
          name: value.name,
          size: value.size,
          type: value.type,
        });
      } else {
        console.log(key, value);
      }
    }

    try {
      const res = await fetch(`/api/events/${event._id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update event");

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
            min={today}
            defaultValue={event.date.split("T")[0]}
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
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Team Size</label>
            <Input
              type="number"
              name="teamSize"
              defaultValue={event.teamSize}
            />
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
