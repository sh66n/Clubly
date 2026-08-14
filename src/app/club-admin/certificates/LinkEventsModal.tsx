"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Link2,
  Loader2,
  Plus,
  Search,
  Sparkles,
  X,
  AlertCircle,
} from "lucide-react";

interface ClubEventItem {
  _id: string;
  name: string;
  date: string;
  providesCertificate: boolean;
  isLinked: boolean;
  isLinkedToOther?: boolean;
}

interface LinkEventsModalProps {
  certificateId: string;
  certificateName: string;
  isDraft?: boolean;
  initialLinkedCount?: number;
  initialLinkedEvents?: { _id: string; name: string }[];
}

export default function LinkEventsModal({
  certificateId,
  certificateName,
  isDraft = false,
  initialLinkedCount = 0,
  initialLinkedEvents = [],
}: LinkEventsModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<ClubEventItem[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const openModal = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/club-admin/certificates/${certificateId}/events`);
      if (!res.ok) {
        throw new Error("Failed to load club events");
      }
      const data = await res.json();
      const fetchedEvents: ClubEventItem[] = data.events || [];
      setEvents(fetchedEvents);

      // Initialize selected set from currently linked events
      const linkedIds = new Set(
        fetchedEvents.filter((e) => e.isLinked).map((e) => e._id)
      );
      setSelectedEventIds(linkedIds);
    } catch (err) {
      toast.error("Failed to load events for this club");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (saving) return;
    setIsOpen(false);
    setSearchQuery("");
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredEvents.map((e) => e._id);
    setSelectedEventIds((prev) => {
      const next = new Set(prev);
      allFilteredIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleDeselectAll = () => {
    const allFilteredIds = new Set(filteredEvents.map((e) => e._id));
    setSelectedEventIds((prev) => {
      const next = new Set(prev);
      allFilteredIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/club-admin/certificates/${certificateId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventIds: Array.from(selectedEventIds) }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update event links");
      }

      toast.success(
        selectedEventIds.size === 0
          ? "Unlinked all events from this certificate"
          : `Linked to ${selectedEventIds.size} event${selectedEventIds.size > 1 ? "s" : ""}`
      );
      closeModal();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <>
      {/* Trigger Button on Certificate Card */}
      <button
        type="button"
        onClick={openModal}
        className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all group ${
          initialLinkedCount > 0
            ? "bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-200 text-emerald-800"
            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Link2
            className={`w-3.5 h-3.5 shrink-0 ${
              initialLinkedCount > 0 ? "text-emerald-600" : "text-slate-400"
            }`}
          />
          <span className="truncate">
            {initialLinkedCount > 0
              ? `${initialLinkedCount} Event${initialLinkedCount > 1 ? "s" : ""} Linked`
              : "Tie to Events"}
          </span>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors shrink-0 ${
            initialLinkedCount > 0
              ? "bg-emerald-200/60 text-emerald-900 group-hover:bg-emerald-200"
              : "bg-slate-200/70 text-slate-700 group-hover:bg-slate-300/70"
          }`}
        >
          Manage
        </span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={closeModal}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    Tie Certificate to Events
                  </h2>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      isDraft
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {isDraft ? "Draft" : "Published"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  Template: <span className="font-semibold text-slate-700">{certificateName}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Quick Filters */}
            <div className="p-4 border-b border-slate-100 bg-white space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search club events by name..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-800 placeholder:text-slate-400 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Selected:{" "}
                  <strong className="text-emerald-700 font-bold">{selectedEventIds.size}</strong>{" "}
                  events
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-slate-600 hover:text-emerald-700 font-semibold transition-colors"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-slate-600 hover:text-red-600 font-semibold transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-50">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <p className="text-xs font-medium">Loading your club's events...</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs font-semibold text-slate-600 mb-1">
                    {searchQuery ? "No matching events found" : "No events found for this club"}
                  </p>
                  <p className="text-[11px]">
                    {searchQuery
                      ? "Try searching for a different keyword."
                      : "Create an event first to attach certificate templates."}
                  </p>
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const isChecked = selectedEventIds.has(event._id);
                  const isOtherCert = event.isLinkedToOther && !isChecked;

                  return (
                    <div
                      key={event._id}
                      onClick={() => toggleEvent(event._id)}
                      className={`pt-2 first:pt-0 flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? "border-emerald-500/80 bg-emerald-50/40 shadow-2xs"
                          : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                      }`}
                    >
                      {/* Checkbox Box */}
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {event.name}
                          </h4>
                          {isOtherCert && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium shrink-0">
                              Replaces other cert
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(event.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-2xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Save Event Links
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
