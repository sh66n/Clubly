"use client";
import { useState } from "react";

export default function CreateEventForm() {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (file) formData.append("image", file);

    const res = await fetch("/api/events", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Created Event:", data);
  };

  return (
    <div className="relative h-screen flex-grow pt-4 pr-4 pb-4">
      <div className="h-full rounded-lg p-10 pb-4 border border-[#515151] relative bg-[url(/images/lb-bg.png)] bg-cover bg-top bg-no-repeat">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="organizingClub" placeholder="Club ID" required />
          <input name="name" placeholder="Event Name" required />
          <textarea name="description" placeholder="Description" />
          <input type="date" name="date" required />
          <select name="eventType" required>
            <option value="individual">Individual</option>
            <option value="team">Team</option>
          </select>
          <input type="number" name="teamSize" placeholder="Team Size" />
          <input type="number" name="prize" placeholder="Prize" />
          <label>
            Provides Certificate?
            <select name="providesCertificate" required>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <input type="number" name="registrationFee" placeholder="Fee" />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}
