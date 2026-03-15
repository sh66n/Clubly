"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Unlock, Loader2 } from "lucide-react";

interface CloseRegistrationToggleProps {
  eventId: string;
  initialStatus: boolean;
}

export default function CloseRegistrationToggle({ eventId, initialStatus }: CloseRegistrationToggleProps) {
  const [isOpen, setIsOpen] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleRegistration = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("isRegistrationOpen", String(!isOpen));

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        toast.error("Failed to update registration status");
        return;
      }

      setIsOpen(!isOpen);
      toast.success(
        !isOpen ? "Registrations opened successfully" : "Registrations closed successfully"
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleRegistration}
      disabled={loading}
      className="flex items-center gap-2 mb-4 w-fit hover:opacity-80 disabled:opacity-50"
    >
      <div className={`flex items-center justify-center p-2 rounded-lg ${isOpen ? 'bg-red-900/80 text-red-200' : 'bg-green-900/80 text-green-200'}`}>
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : isOpen ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
      </div>
      {isOpen ? "Close Registrations" : "Open Registrations"}
    </button>
  );
}
