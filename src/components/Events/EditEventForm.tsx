"use client";

import { Session } from "next-auth";
import { useState, useEffect } from "react";
import Input from "../Input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BackButton from "../BackButton";
import { IEvent } from "@/models/event.schema";
import CustomQuestionsEditor, {
  CustomQuestion,
  normalizeCustomQuestions,
} from "./CustomQuestionsEditor";


interface EditEventFormProps {
  user: Session["user"];
  event: IEvent;
}

export default function EditEventForm({ user, event }: EditEventFormProps) {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [file, setFile] = useState<File | null>(null);
  const [eventType, setEventType] = useState<"individual" | "team">(
    event.eventType,
  );
  const [loading, setLoading] = useState(false);
  const [teamSizeMode, setTeamSizeMode] = useState<"fixed" | "range">(
    event.teamSizeRange ? "range" : "fixed",
  );
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(
    (event.customQuestions ?? []).map((question) => ({
      ...question,
      options: question.options ?? [],
    })),
  );
  const initialCertId = event.certificate
    ? typeof event.certificate === "object" && event.certificate !== null && "_id" in event.certificate
      ? String((event.certificate as any)._id)
      : String(event.certificate)
    : "";

  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCertificateId, setSelectedCertificateId] = useState<string>(initialCertId);
  const [providesCertificate, setProvidesCertificate] = useState(event.providesCertificate);

  // Fetch certificates on mount
  useEffect(() => {
    async function fetchCertificates() {
      try {
        const certRes = await fetch(`/api/club-admin/certificates`);
        if (certRes.ok) {
          const certData = await certRes.json();
          setCertificates(certData);
          // If no cert is currently selected but event had one or we have certs
          if (!initialCertId && certData.length > 0 && event.providesCertificate) {
            setSelectedCertificateId(certData[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch certificates", err);
      }
    }
    fetchCertificates();
  }, [initialCertId, event.providesCertificate]);

  useEffect(() => {
    if (event.certificate) {
      const certId =
        typeof event.certificate === "object" && event.certificate !== null && "_id" in event.certificate
          ? String((event.certificate as any)._id)
          : String(event.certificate);
      setSelectedCertificateId(certId);
    }
  }, [event.certificate]);

  const d = new Date(event.date);

  // Force IST extraction
  const istTime = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const defaultTime = istTime;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (eventType === "individual") {
      formData.set("teamSize", "1");
      formData.delete("teamSizeRange[min]");
      formData.delete("teamSizeRange[max]");
    }

    if (eventType === "team") {
      if (teamSizeMode === "fixed") {
        formData.delete("teamSizeRange[min]");
        formData.delete("teamSizeRange[max]");
      }

      if (teamSizeMode === "range") {
        formData.delete("teamSize");
      }
    }

    if (file) {
      formData.append("image", file);
    }
    formData.set("providesCertificate", String(providesCertificate));
    if (providesCertificate && selectedCertificateId) {
      formData.set("certificateId", selectedCertificateId);
    } else {
      formData.set("certificateId", "");
    }
    formData.set(
      "customQuestions",
      JSON.stringify(normalizeCustomQuestions(customQuestions)),
    );

    try {
      const res = await fetch(`/api/events/${event._id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();

        // if not logged in
        if (res.status === 401) {
          router.push(
            `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
          );
          return;
        }

        // if not admin or is club-admin of other club
        if (res.status === 403) {
          router.replace("/forbidden");
          return;
        }

        //fallback
        toast.error(data.error);
        return;
      }

      toast.success("Event updated successfully");
      router.push(`/events/${event._id}`);
      router.refresh();
    } catch (err) {
      toast.error("Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const selectedCertObj = certificates.find(
    (c) => c._id?.toString() === selectedCertificateId?.toString()
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <BackButton />
        <h1 className="text-3xl font-bold">Edit Event</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-xl mx-auto my-12"
      >
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Event Name</label>
          <Input name="name" defaultValue={event.name} required />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Description</label>
          <textarea
            name="description"
            defaultValue={event.description}
            className="w-full rounded-xl border border-gray-700 p-3 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Date</label>
          <Input
            type="date"
            name="date"
            defaultValue={d.toISOString().split("T")[0]}
            min={today}
            required
          />
        </div>

        {/* Time */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Event Time (IST)</label>
          <Input
            type="time"
            name="eventTime"
            defaultValue={defaultTime}
            required
          />
        </div>

        {/* Event Type */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Event Type</label>
          <select
            name="eventType"
            value={eventType}
            onChange={(e) =>
              setEventType(e.target.value as "individual" | "team")
            }
            className="max-w-xs rounded-xl border border-gray-700 px-4 py-2 bg-gray-800"
          >
            <option value="individual">Individual</option>
            <option value="team">Team</option>
          </select>
        </div>

        {/* Team Size */}
        {eventType === "team" && (
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">Team Size Mode</label>
            <select
              value={teamSizeMode}
              onChange={(e) =>
                setTeamSizeMode(e.target.value as "fixed" | "range")
              }
              className="max-w-xs rounded-xl border border-gray-700 px-4 py-2 bg-gray-800"
            >
              <option value="fixed">Fixed Size</option>
              <option value="range">Min-Max Range</option>
            </select>

            {teamSizeMode === "fixed" && (
              <Input
                type="number"
                name="teamSize"
                min={1}
                defaultValue={event.teamSize}
                placeholder="Team Size"
                required
              />
            )}

            {teamSizeMode === "range" && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  name="teamSizeRange[min]"
                  min={1}
                  defaultValue={event.teamSizeRange?.min}
                  placeholder="Min"
                  required
                />
                <Input
                  type="number"
                  name="teamSizeRange[max]"
                  min={1}
                  defaultValue={event.teamSizeRange?.max}
                  placeholder="Max"
                  required
                />
              </div>
            )}
          </div>
        )}

        {/* Prize */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Prize</label>
          <Input type="number" name="prize" defaultValue={event.prize} />
        </div>

        {/* Certificate */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-gray-900/60 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-gray-200">Provides Certificate?</label>
              <p className="text-xs text-gray-400">Attendees will receive verified certificates</p>
            </div>
            <select
              name="providesCertificate"
              value={String(providesCertificate)}
              onChange={(e) => setProvidesCertificate(e.target.value === "true")}
              className="rounded-xl border border-gray-700 px-3 py-1.5 bg-gray-800 text-sm"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {providesCertificate && (
            <div className="flex flex-col gap-2 pt-3 border-t border-gray-800">
              <label className="text-xs font-semibold text-gray-300">Linked Certificate Template</label>
              {certificates.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-700 text-center">
                  <p className="text-sm text-gray-400 mb-1">No certificate templates found for your club.</p>
                  <a
                    href="/club-admin/certificates/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 text-xs font-semibold hover:underline"
                  >
                    + Create a Certificate Template
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <select
                    name="certificateId"
                    value={selectedCertificateId}
                    onChange={(e) => setSelectedCertificateId(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 px-4 py-2.5 bg-gray-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Select a certificate template --</option>
                    {certificates.map((cert) => (
                      <option key={cert._id} value={cert._id}>
                        {cert.name} {cert.isDraft ? "(Draft)" : "(Published)"}
                      </option>
                    ))}
                  </select>

                  {/* Selected Certificate Info / Thumbnail */}
                  {selectedCertObj && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/80 border border-gray-700">
                      {selectedCertObj.url && (
                        <div className="w-16 h-11 rounded-lg overflow-hidden bg-black/40 border border-gray-700 shrink-0">
                          <img
                            src={selectedCertObj.url}
                            alt={selectedCertObj.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{selectedCertObj.name}</p>
                        <p className="text-[11px] text-emerald-400">
                          {selectedCertObj.isDraft ? "Draft template" : "Published template"}
                        </p>
                      </div>
                      <a
                        href={`/club-admin/certificates/${selectedCertObj._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:underline shrink-0"
                      >
                        Open Studio ↗
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Registration Fee */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Registration Fee</label>
          <Input
            type="number"
            name="registrationFee"
            defaultValue={event.registrationFee}
          />
        </div>

        {/* Max Registrations */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Max Registrations</label>
          <Input
            type="number"
            name="maxRegistrations"
            defaultValue={event.maxRegistrations}
          />
        </div>

        {/* Image */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Update Event Banner</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-xl border border-gray-700 p-3 bg-gray-800"
          />
        </div>

        <CustomQuestionsEditor
          value={customQuestions}
          onChange={setCustomQuestions}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 py-2 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Updating..." : "Update Event"}
        </button>
      </form>
    </>
  );
}
