"use client";
import { Session } from "next-auth";
import { useState } from "react";
import Input from "../Input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

interface NewEventFormProps {
  user: Session["user"];
}

export default function NewEventForm({ user }: NewEventFormProps) {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  const [file, setFile] = useState<File | null>(null);
  const [eventType, setEventType] = useState<"individual" | "team">(
    "individual"
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

    formData.append("organizingClub", user.adminClub);

    if (file) formData.append("image", file);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Created Event:", data);
      router.push("/events");
      toast.success("Event created successfully");
    } catch (err) {
      console.error("Error creating event:", err);
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
        <label htmlFor="name" className="text-sm font-medium text-gray-300">
          Event Name
        </label>
        <Input name="name" id="name" placeholder="Enter event name" required />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-gray-300"
        >
          Description
        </label>
        <textarea
          name="description"
          id="description"
          placeholder="Write about the event..."
          className="w-full rounded-xl border border-gray-700 px-4 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
        />
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium text-gray-300">
          Date
        </label>
        <Input
          type="date"
          name="date"
          id="date"
          className="max-w-xs"
          required
          min={today} // prevents selecting past dates
        />
      </div>

      {/* Event Type */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="eventType"
          className="text-sm font-medium text-gray-300"
        >
          Event Type
        </label>
        <select
          name="eventType"
          id="eventType"
          required
          value={eventType}
          onChange={(e) =>
            setEventType(e.target.value as "individual" | "team")
          }
          className="max-w-xs rounded-xl border border-gray-700 px-4 py-2 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
        >
          <option value="individual">Individual</option>
          <option value="team">Team</option>
        </select>
      </div>

      {/* Team Size */}
      {eventType === "team" && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="teamSize"
            className="text-sm font-medium text-gray-300"
          >
            Team Size
          </label>
          <Input
            type="number"
            name="teamSize"
            id="teamSize"
            placeholder="Enter team size"
          />
        </div>
      )}

      {/* Prize */}
      <div className="flex flex-col gap-1">
        <label htmlFor="prize" className="text-sm font-medium text-gray-300">
          Prize
        </label>
        <Input
          type="number"
          name="prize"
          id="prize"
          placeholder="Prize amount"
        />
      </div>

      {/* Certificate */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="providesCertificate"
          className="text-sm font-medium text-gray-300"
        >
          Provides Certificate?
        </label>
        <select
          name="providesCertificate"
          id="providesCertificate"
          required
          className="max-w-xs rounded-xl border border-gray-700 px-4 py-2 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      {/* Registration Fee */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="registrationFee"
          className="text-sm font-medium text-gray-300"
        >
          Registration Fee
        </label>
        <Input
          type="number"
          name="registrationFee"
          id="registrationFee"
          placeholder="Enter fee"
          className="max-w-xs"
        />
      </div>

      {/* Max registrations */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="maxRegistrations"
          className="text-sm font-medium text-gray-300"
        >
          Max Registrations
        </label>
        <Input
          type="number"
          name="maxRegistrations"
          id="maxRegistrations"
          placeholder="Enter limit"
          className="max-w-xs"
        />
      </div>

      {/* File Upload */}
      <div className="flex flex-col gap-1">
        <label htmlFor="image" className="text-sm font-medium text-gray-300">
          Event Banner
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="rounded-xl border border-gray-700 p-3 bg-gray-800 text-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white hover:file:bg-blue-700"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl shadow flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="animate-spin h-5 w-5" />}
        {loading ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
}
