"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderPlus, Folder, Loader2, X, Award } from "lucide-react";

interface EventOption {
  _id: string;
  name: string;
  date?: string;
  numberOfWinners?: number;
  providesCertificate?: boolean;
}

interface GenerateEventFolderModalProps {
  events: EventOption[];
}

export default function GenerateEventFolderModal({ events }: GenerateEventFolderModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    if (events.length > 0) {
      setSelectedEventId(events[0]._id);
    }
    setIsOpen(true);
  };

  const selectedEvent = events.find((ev) => ev._id === selectedEventId) || events[0];
  const winnersCount = selectedEvent?.numberOfWinners || 1;

  const handleGenerate = async () => {
    if (!selectedEventId) {
      toast.error("Please select an event");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/club-admin/certificates/generate-event-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          numberOfWinners: winnersCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate event slots");
      }

      toast.success(data.message || "Event certificate folder & slots generated!");
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl font-semibold transition-all shadow-sm border border-slate-200 text-sm active:scale-95"
      >
        <Folder className="w-4 h-4 text-slate-500" /> Create Event Folder
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !loading && setIsOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <FolderPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Generate Event Folder</h2>
                <p className="text-xs text-slate-500">Auto-create certificate slots for an event</p>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                No events found. Please create an event first.
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Select Event
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {events.map((ev) => (
                      <option key={ev._id} value={ev._id}>
                        {ev.name} {ev.date ? `(${new Date(ev.date).toLocaleDateString()})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {1 + winnersCount}
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Auto-configured Slots:</span>
                    <p className="text-slate-500 mt-0.5">
                      1 Participant slot + {winnersCount} Winner slot{winnersCount > 1 ? "s" : ""} based on this event.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        Generate Slots
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
