"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewSuperEventForm({
  organizingClubId,
}: {
  organizingClubId: string;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Super Event name is required");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("organizingClub", organizingClubId);
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("startDate", form.startDate);
    formData.append("endDate", form.endDate);

    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await fetch("/api/superevents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to create super event");
      }

      const superEvent = await res.json();
      toast.success("Super Event created");

      router.push(`/superevents/${superEvent._id}`);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {/* Name */}
      <div>
        <label className="block font-medium mb-1">Super Event Name *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Tech Fest 2026"
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="A multi-day technical festival"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Image */}
      <div>
        <label className="block font-medium mb-1">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-5 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Super Event"}
      </button>
    </form>
  );
}
