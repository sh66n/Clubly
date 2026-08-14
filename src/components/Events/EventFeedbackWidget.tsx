"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Download, X, Loader2, Award, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EventFeedbackWidgetProps {
  eventId: string;
  eventName: string;
}

const SYSTEM_FONT_STACK: Record<string, string> = {
  helvetica: "Helvetica, Arial, sans-serif",
  times: "'Times New Roman', Times, serif",
  courier: "'Courier New', Courier, monospace",
  georgia: "Georgia, serif",
  arial: "Arial, sans-serif",
  verdana: "Verdana, sans-serif",
  impact: "Impact, sans-serif",
  trebuchet: "'Trebuchet MS', sans-serif",
};

const getFontFamilyCss = (fontFamily: string) => {
  const normalized = (fontFamily || "helvetica").toLowerCase().trim();
  if (SYSTEM_FONT_STACK[normalized]) {
    return SYSTEM_FONT_STACK[normalized];
  }
  return `"${fontFamily}", cursive, serif, sans-serif`;
};

const loadGoogleFont = (fontFamily: string) => {
  if (typeof document === "undefined" || !fontFamily) return;
  const lower = fontFamily.toLowerCase().trim();
  if (SYSTEM_FONT_STACK[lower]) return;

  const fontId = `gfont-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`;
  if (!document.getElementById(fontId)) {
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    document.head.appendChild(link);
  }
};

export default function EventFeedbackWidget({ eventId, eventName }: EventFeedbackWidgetProps) {
  const router = useRouter();
  
  // Widget states
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [feedbackRequired, setFeedbackRequired] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState<any>(null);
  const [certificate, setCertificate] = useState<any>(null);
  const [userName, setUserName] = useState<string>("Student");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [imgScale, setImgScale] = useState<{ clientWidth: number; naturalWidth: number }>({ clientWidth: 600, naturalWidth: 1920 });
  
  const [submitting, setSubmitting] = useState(false);
  const [certDownloading, setCertDownloading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, [eventId]);

  useEffect(() => {
    if (certificate?.layout?.tokens) {
      certificate.layout.tokens.forEach((t: any) => {
        if (t.fontFamily) loadGoogleFont(t.fontFamily);
      });
    }
  }, [certificate]);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const formRes = await fetch(`/api/events/${eventId}/feedback`);
      if (formRes.ok) {
        const formData = await formRes.json();
        if (formData.certificate) {
          setCertificate(formData.certificate);
          if (formData.certificate.layout?.tokens) {
            formData.certificate.layout.tokens.forEach((t: any) => {
              if (t.fontFamily) loadGoogleFont(t.fontFamily);
            });
          }
        }
        if (formData.userName) {
          setUserName(formData.userName);
        }

        if (formData.form && !formData.submitted) {
          setFeedbackRequired(true);
          setFeedbackSubmitted(false);
          setFeedbackForm(formData.form);
          return;
        } else if (formData.submitted) {
          setFeedbackRequired(false);
          setFeedbackSubmitted(true);
          return;
        }
      }

      setFeedbackRequired(false);
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (questionId: string, rating: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: rating }));
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackForm) return;

    for (const q of feedbackForm.questions) {
      if (q.required && !answers[q.id]) {
        toast.error("Please answer all required questions");
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
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (!res.ok) throw new Error("Failed to submit feedback");
      
      toast.success("Thank you for your feedback! Certificate unlocked.");
      setFeedbackSubmitted(true);
      setFeedbackRequired(false);
      checkStatus();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCertificate = async () => {
    setCertDownloading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/certificate`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to download certificate");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${eventName}-Certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Certificate downloaded successfully!");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to download certificate");
    } finally {
      setCertDownloading(false);
    }
  };

  if (loading) return null;
  if (!feedbackRequired && !feedbackSubmitted && !certificate) return null;

  const renderCertificatePreview = () => {
    if (certificate?.url) {
      const tokens = certificate.layout?.tokens || [];
      const valueMap: Record<string, string> = {
        $name: userName,
        $year: "Year 3",
        $rank: "Winner",
        $event: eventName,
        $club: "Clubly",
        $date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      };

      const scale = imgScale.naturalWidth > 0 ? imgScale.clientWidth / imgScale.naturalWidth : 0.4;

      return (
        <div className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-black/40 flex items-center justify-center">
          <img
            src={certificate.url}
            alt="Certificate Template"
            onLoad={(e) => {
              const img = e.currentTarget;
              setImgScale({
                clientWidth: img.clientWidth,
                naturalWidth: img.naturalWidth || 1920,
              });
            }}
            className="w-full h-auto object-contain select-none pointer-events-none"
          />
          {tokens.map((token: any) => {
            const text = valueMap[token.variable] ?? (token.variable?.startsWith("$") ? token.variable.slice(1) : token.variable);
            const tokenX = token.x ?? 0.5;
            const tokenY = token.y ?? 0.5;
            // token.y is stored from bottom (0 to 1 in PDF coordinates), so top is 1 - token.y
            const topPct = (1 - tokenY) * 100;
            const leftPct = tokenX * 100;

            const transformOrigin = token.align === "left" ? "translate(0%, -50%)" : token.align === "right" ? "translate(-100%, -50%)" : "translate(-50%, -50%)";
            const calculatedFontSize = Math.max(10, Math.round((token.fontSize || 44) * scale));

            return (
              <div
                key={token.id || token.variable}
                style={{
                  position: "absolute",
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: transformOrigin,
                  color: token.colorHex || "#111111",
                  fontFamily: getFontFamilyCss(token.fontFamily),
                  fontSize: `${calculatedFontSize}px`,
                  fontWeight: token.bold ? 700 : 400,
                  fontStyle: token.italic ? "italic" : "normal",
                  lineHeight: 1.1,
                }}
                className="whitespace-nowrap pointer-events-none select-none drop-shadow-sm"
              >
                {text}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="w-full aspect-[1.414] bg-white rounded-lg shadow-xl mb-8 flex items-center justify-center p-1 border border-gray-200">
        <div className="w-full h-full border-[6px] border-double border-gray-300 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 relative overflow-hidden">
          <Award className="w-20 h-20 text-blue-500 mb-4 opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150" />
          <h2 className="text-3xl font-serif text-gray-800 mb-2 relative z-10">Certificate of Completion</h2>
          <p className="text-sm text-gray-500 relative z-10">Presented to</p>
          <p className="text-xl font-bold text-gray-900 my-4 border-b border-gray-300 pb-1 relative z-10 px-8">{userName}</p>
          <p className="text-xs text-gray-500 relative z-10 max-w-xs">{eventName}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Persistent Bottom-Right Thumbnail */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <button
              onClick={() => setIsOpen(true)}
              className={`group relative flex items-center justify-center p-0 rounded-2xl shadow-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105 active:scale-95
                ${feedbackRequired ? 'w-48 h-16 bg-gradient-to-r from-amber-500 to-amber-600' : 'w-36 h-24 bg-white border border-gray-200'}
              `}
            >
              {feedbackRequired ? (
                <div className="flex items-center justify-center gap-3 w-full h-full text-white px-4">
                  <Star className="fill-white w-5 h-5 animate-pulse shrink-0" />
                  <span className="font-bold text-xs leading-tight text-left">
                    Give feedback to unlock certificate!
                  </span>
                </div>
              ) : certificate?.url ? (
                <div className="w-full h-full relative overflow-hidden rounded-xl bg-gray-900 flex items-center justify-center">
                  <img src={certificate.url} alt="Certificate" className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-blue-600/30 transition-colors flex flex-col items-center justify-center">
                    <Download className="text-white w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Download</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl m-1 group-hover:border-blue-500 transition-colors">
                  <Award className="text-blue-500 mb-1 w-6 h-6" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Certificate
                  </span>
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Download className="text-blue-600 w-5 h-5" />
                  </div>
                </div>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              layoutId="widget"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-[#0f1115] w-full max-w-3xl rounded-[2rem] border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {feedbackRequired ? "Event Feedback" : "Your Certificate"}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {eventName}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                {feedbackRequired && feedbackForm ? (
                  <div className="space-y-8">
                    {feedbackForm.questions.map((q: any) => (
                      <div key={q.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                        <p className="text-white font-medium mb-4 text-lg">
                          {q.text} {q.required && <span className="text-red-500">*</span>}
                        </p>
                        <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRating(q.id, star)}
                              className={`p-2 transition-all transform hover:scale-110 focus:outline-none cursor-pointer ${
                                (answers[q.id] || 0) >= star
                                  ? "text-amber-400"
                                  : "text-gray-600 hover:text-gray-400"
                              }`}
                            >
                              <Star
                                size={32}
                                className={(answers[q.id] || 0) >= star ? "fill-amber-400" : ""}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    {renderCertificatePreview()}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-800 bg-gray-900/50 shrink-0">
                {feedbackRequired ? (
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={submitting}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-amber-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Submit & Unlock Certificate <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleDownloadCertificate}
                    disabled={certDownloading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {certDownloading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Download size={20} /> Download PDF
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
