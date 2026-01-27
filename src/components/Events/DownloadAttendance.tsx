"use client";

import { Download } from "lucide-react";
import React, { useState } from "react";

interface Props {
  eventId: string;
}

export default function DownloadAttendance({ eventId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/events/${eventId}/attendance/download`,
      );

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // 1. Create a Blob from the response
      const blob = await response.blob();

      // 2. Create a temporary anchor element
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-${eventId}.csv`; // Fallback filename

      // 3. Trigger the click and cleanup
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Could not download the attendance list.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="flex items-center gap-2 mb-4 w-fit hover:opacity-80 hover:cursor-pointer"
      onClick={handleDownload}
      disabled={loading}
    >
      <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
        <Download />
      </div>
      Download attendance
    </button>
  );
}
