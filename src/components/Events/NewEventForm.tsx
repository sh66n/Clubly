"use client";

import { Session } from "next-auth";
import { useEffect, useState } from "react";
import Input from "../Input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NewEventFormProps {
  user: Session["user"];
}

interface SuperEvent {
  _id: string;
  name: string;
}

export default function NewEventForm({ user }: NewEventFormProps) {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [file, setFile] = useState<File | null>(null);
  const [eventType, setEventType] = useState<"individual" | "team">(
    "individual",
  );
  const [loading, setLoading] = useState(false);

  const [superEvents, setSuperEvents] = useState<SuperEvent[]>([]);
  const [selectedSuperEvent, setSelectedSuperEvent] = useState("");

  /* ---------------- Fetch SuperEvents ---------------- */
  useEffect(() => {
    async function fetchSuperEvents() {
      try {
        const res = await fetch(`/api/superevents?club=${user.adminClub}`);
        const data = await res.json();
        setSuperEvents(data);
      } catch (err) {
        console.error("Failed to fetch super events", err);
      }
    }

    fetchSuperEvents();
  }, [user.adminClub]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (eventType === "individual") {
      formData.set("teamSize", "1");
    }

    formData.append("organizingClub", user.adminClub);

    if (selectedSuperEvent) {
      formData.append("superEvent", selectedSuperEvent);
    }

    if (file) {
      formData.append("image", file);
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      await res.json();
      toast.success("Event created successfully");
      router.push("/events");
    } catch (err) {
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-6 bg-black border border-[#515151] text-white rounded-2xl"
    >
      {/* Event Name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300">Event Name</label>
        <Input name="name" placeholder="Enter event name" required />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300">Description</label>
        <textarea
          name="description"
          placeholder="Write about the event..."
          className="w-full h-40 rounded-xl border border-gray-700 px-4 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300">Date</label>
        <Input type="date" name="date" min={today} required />
      </div>

      {/* Event Type */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300">Event Type</label>
        <select
          name="eventType"
          value={eventType}
          onChange={(e) =>
            setEventType(e.target.value as "individual" | "team")
          }
          className="max-w-xs rounded-xl border border-gray-700 px-4 py-2 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="individual">Individual</option>
          <option value="team">Team</option>
        </select>
      </div>

      {/* Team Size */}
      {eventType === "team" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">Team Size</label>
          <Input type="number" name="teamSize" placeholder="Enter team size" />
        </div>
      )}

      {/* Super Event */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300">
          Add to Super Event (optional)
        </label>
        <select
          name="superEvent"
          value={selectedSuperEvent}
          onChange={(e) => setSelectedSuperEvent(e.target.value)}
          className="max-w-xs rounded-xl border border-gray-700 px-4 py-2 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">None</option>
          {superEvents.map((se) => (
            <option key={se._id} value={se._id}>
              {se.name}
            </option>
          ))}
        </select>
      </div>

      {/* Prize */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300">Prize</label>
        <Input type="number" name="prize" placeholder="Prize amount" />
      </div>

      {/* Certificate */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300">
          Provides Certificate?
        </label>
        <select
          name="providesCertificate"
          className="max-w-xs rounded-xl border border-gray-700 px-4 py-2 bg-gray-800 text-gray-200"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      {/* Registration Fee */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300">
          Registration Fee
        </label>
        <Input type="number" name="registrationFee" />
      </div>

      {/* Max Registrations */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300">
          Max Registrations
        </label>
        <Input type="number" name="maxRegistrations" />
      </div>

      {/* Image */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300">
          Event Banner
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="rounded-xl border border-gray-700 p-3 bg-gray-800 text-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white hover:file:bg-blue-700"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 py-2 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading && <Loader2 className="animate-spin h-5 w-5" />}
        {loading ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
}
