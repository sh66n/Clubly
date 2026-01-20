"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Globe, Lock, Loader2 } from "lucide-react";
import BackButton from "../BackButton";

export default function NewGroupForm({ eventId }: { eventId: string }) {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Group name is required");

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isPublic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create group");

      toast.success(`Group created: ${data.name}`);
      router.push(`/events/${eventId}`);
      router.refresh();
    } catch (err: any) {
      toast.error(`${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <BackButton />
      <div className="">
        <div className="max-w-lg">
          <div className="mb-8 mt-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Create Group
            </h1>
            <p className="text-gray-500 mt-2">
              Set up a team to participate in this event.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">
                Group Name
              </label>
              <input
                type="text"
                placeholder="e.g. Team Cyber"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#121212] border border-[#2A2A2A] text-white rounded-xl p-3 outline-none focus:border-gray-500 transition-colors placeholder:text-gray-700"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    isPublic
                      ? "bg-white text-black border-white"
                      : "bg-transparent border-[#2A2A2A] text-gray-500 hover:border-gray-700"
                  }`}
                >
                  <Globe size={16} />
                  <span className="text-sm font-semibold">Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    !isPublic
                      ? "bg-white text-black border-white"
                      : "bg-transparent border-[#2A2A2A] text-gray-500 hover:border-gray-700"
                  }`}
                >
                  <Lock size={16} />
                  <span className="text-sm font-semibold">Private</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-600 ml-1">
                {isPublic
                  ? "Anyone can find and join this group."
                  : "Only people with the join code can enter."}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name}
              className="w-full mt-4 bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Creating..." : "Create Group"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
