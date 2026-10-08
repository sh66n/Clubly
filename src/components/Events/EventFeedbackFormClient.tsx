"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ArrowLeft,
  Check,
  Copy,
  Share2,
  Award,
  Loader2,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";
import BorderedDiv from "@/components/BorderedDiv";

interface Question {
  id: string;
  text: string;
  required: boolean;
}

interface FeedbackFormData {
  _id: string;
  name: string;
  questions: Question[];
}

interface EventFeedbackFormClientProps {
  eventId: string;
  eventName: string;
  eventDate?: string;
  organizingClubName?: string;
  organizingClubLogo?: string;
  form: FeedbackFormData | null;
  hasFeedback: boolean;
  hasCertificate: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function EventFeedbackFormClient({
  eventId,
  eventName,
  eventDate,
  organizingClubName,
  organizingClubLogo,
  form,
  hasFeedback,
  hasCertificate,
}: EventFeedbackFormClientProps) {
  const router = useRouter();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [hoveredStars, setHoveredStars] = useState<Record<string, number | null>>({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/events/${eventId}/feedback`;
    }
    return `https://clubly.in/events/${eventId}/feedback`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      toast.success("Feedback form link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShareWhatsApp = () => {
    const text = `📝 Share your feedback for *${eventName}* on Clubly: ${getShareUrl()}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareTwitter = () => {
    const text = `Feedback form for ${eventName} on @clubly_in: ${getShareUrl()}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleRating = (questionId: string, rating: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    for (const q of form.questions) {
      if (q.required && !answers[q.id]) {
        toast.error(`Please answer: "${q.text}"`);
        return;
      }
    }

    const formattedAnswers = Object.entries(answers).map(([questionId, rating]) => ({
      questionId,
      rating,
    }));

    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: formattedAnswers,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit feedback");
      }

      toast.success("Feedback submitted successfully!");

      if (hasCertificate) {
        router.push(`/events/${eventId}?openCertificate=true`);
      } else {
        router.push(`/events/${eventId}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback");
      setSubmitting(false);
    }
  };

  // State 1: Feedback already submitted
  if (hasFeedback) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Event
        </Link>

        <BorderedDiv className="p-8 sm:p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Feedback Already Submitted
          </h2>
          <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
            Thank you! You have already shared your feedback for{" "}
            <span className="text-white font-medium">{eventName}</span>.
            {hasCertificate && " Your certificate is ready to view and download."}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href={`/events/${eventId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              {hasCertificate ? (
                <>
                  <Award size={16} />
                  View Certificate & Event
                </>
              ) : (
                "View Event Details"
              )}
            </Link>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white text-sm transition-colors cursor-pointer"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              {copied ? "Link Copied" : "Share Feedback Link"}
            </button>
          </div>
        </BorderedDiv>
      </div>
    );
  }

  // State 2: No feedback form configured for this event
  if (!form || !form.questions || form.questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Event
        </Link>

        <BorderedDiv className="p-8 sm:p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            No Feedback Form Available
          </h2>
          <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
            There is currently no active feedback form configured for{" "}
            <span className="text-white font-medium">{eventName}</span>.
          </p>

          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            Back to Event
          </Link>
        </BorderedDiv>
      </div>
    );
  }

  // State 3: Active Feedback Form
  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Event
        </Link>

        {/* Share Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyLink}
            title="Copy feedback link"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            title="Share via WhatsApp"
            className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors cursor-pointer"
          >
            <FaWhatsapp size={14} />
          </button>

          <button
            type="button"
            onClick={handleShareTwitter}
            title="Share via Twitter / X"
            className="p-1.5 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <FaXTwitter size={14} />
          </button>
        </div>
      </div>

      {/* Event Details Card */}
      <BorderedDiv className="p-5 sm:p-6 mb-6">
        <div className="flex items-start gap-4">
          {organizingClubLogo ? (
            <img
              src={organizingClubLogo}
              alt={organizingClubName || "Club"}
              className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 shrink-0">
              <MessageSquare size={20} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            {organizingClubName && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {organizingClubName}
              </p>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
              {eventName}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Event Feedback Form {eventDate && `• ${new Date(eventDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        {hasCertificate && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-3 text-xs text-amber-300/90 bg-amber-500/[0.08] px-3.5 py-2.5 rounded-xl border border-amber-500/20">
            <Sparkles size={16} className="text-amber-400 shrink-0" />
            <span>
              Submitting this feedback form will automatically unlock your verified event certificate!
            </span>
          </div>
        )}
      </BorderedDiv>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {form.questions.map((q, idx) => {
          const currentRating = hoveredStars[q.id] ?? answers[q.id] ?? 0;
          return (
            <BorderedDiv key={q.id} className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-sm sm:text-base font-medium text-white leading-snug">
                  <span className="text-gray-500 mr-2">{idx + 1}.</span>
                  {q.text}
                  {q.required && <span className="text-rose-400 ml-1 font-bold">*</span>}
                </p>
                {answers[q.id] && (
                  <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md shrink-0">
                    {RATING_LABELS[answers[q.id]]}
                  </span>
                )}
              </div>

              {/* Star Rating Controls */}
              <div className="flex items-center gap-2 sm:gap-3 py-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = currentRating >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() =>
                        setHoveredStars((prev) => ({ ...prev, [q.id]: star }))
                      }
                      onMouseLeave={() =>
                        setHoveredStars((prev) => ({ ...prev, [q.id]: null }))
                      }
                      onClick={() => handleRating(q.id, star)}
                      aria-label={`${star} star rating`}
                      className="p-1.5 transition-transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-none"
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          isFilled
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-700 hover:text-zinc-500"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 mt-1">
                <span>1 - Poor</span>
                <span>5 - Excellent</span>
              </div>
            </BorderedDiv>
          );
        })}

        {/* Optional Comments Box */}
        <BorderedDiv className="p-5 sm:p-6">
          <label className="block text-sm font-medium text-white mb-1.5">
            Additional Comments or Suggestions <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Anything you enjoyed or areas where the organizers could improve?
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Write your thoughts here..."
            className="w-full bg-[#111215] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none transition-colors"
          />
        </BorderedDiv>

        {/* Submit Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-white hover:bg-gray-200 active:bg-gray-300 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>

          <Link
            href={`/events/${eventId}`}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-semibold text-center transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
