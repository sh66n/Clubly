"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DownloadCertificateButtonProps {
  eventId: string;
  eventName: string;
  compact?: boolean;
}

const sanitizeFilenamePart = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase();

export default function DownloadCertificateButton({
  eventId,
  eventName,
  compact = false,
}: DownloadCertificateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/events/${eventId}/certificate`, {
        method: "GET",
      });

      if (!res.ok) {
        let message = "Unable to download certificate";
        try {
          const data = await res.json();
          if (typeof data?.error === "string" && data.error.trim()) {
            message = data.error;
          }
        } catch {
          // Ignore JSON parse errors and fallback to generic message
        }
        toast.error(message);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const safeEventName = sanitizeFilenamePart(eventName || "event");
      anchor.href = url;
      anchor.download = `${safeEventName}-certificate.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
      toast.success("Certificate download started");
    } catch {
      toast.error("Failed to download certificate");
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs border border-gray-600 hover:border-gray-400 text-gray-200 disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        Download Certificate
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isLoading}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-60"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      {isLoading ? "Preparing certificate..." : "Download Certificate"}
    </button>
  );
}
