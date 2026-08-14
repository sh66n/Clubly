"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Download, X, Loader2, Award, ArrowRight, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import BorderedDiv from "@/components/BorderedDiv";

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

const triggerConfetti = () => {
  if (typeof window === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#60A5FA", "#34D399", "#FBBF24", "#F472B6", "#A78BFA", "#F87171", "#FDE047", "#FFFFFF"];
  const particles: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    vx: number;
    vy: number;
    rot: number;
    vrot: number;
    color: string;
    opacity: number;
  }> = [];

  const count = 100;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.4 + (Math.random() - 0.5) * 100,
      w: Math.random() * 8 + 6,
      h: Math.random() * 6 + 4,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -14 - 5,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
    });
  }

  let animationFrameId: number;
  const startTime = Date.now();
  const duration = 2600;

  const render = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const progress = elapsed / duration;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // gravity
      p.vx *= 0.99;
      p.rot += p.vrot;
      p.opacity = Math.max(0, 1 - progress);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    animationFrameId = requestAnimationFrame(render);
  };

  animationFrameId = requestAnimationFrame(render);
};

export default function EventFeedbackWidget({ eventId, eventName }: EventFeedbackWidgetProps) {
  const router = useRouter();
  
  // Widget states
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Data states
  const [feedbackRequired, setFeedbackRequired] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState<any>(null);
  const [certificate, setCertificate] = useState<any>(null);
  const [userName, setUserName] = useState<string>("Student");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [hoveredStars, setHoveredStars] = useState<Record<string, number | null>>({});
  const [imgScale, setImgScale] = useState<{ clientWidth: number; naturalWidth: number }>({ clientWidth: 600, naturalWidth: 1920 });
  
  const [submitting, setSubmitting] = useState(false);
  const [certDownloading, setCertDownloading] = useState(false);

  useEffect(() => {
    checkStatus(true);
  }, [eventId]);

  useEffect(() => {
    if (certificate?.layout?.tokens) {
      certificate.layout.tokens.forEach((t: any) => {
        if (t.fontFamily) loadGoogleFont(t.fontFamily);
      });
    }
  }, [certificate]);

  const checkStatus = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const formRes = await fetch(`/api/events/${eventId}/feedback`);
      if (formRes.ok) {
        const formData = await formRes.json();
        if (formData.certificate) {
          setCertificate(formData.certificate);
          // Preload certificate template image for instantaneous rendering
          if (formData.certificate.url) {
            const preloadImg = new Image();
            preloadImg.src = formData.certificate.url;
          }
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
      if (isInitial) setLoading(false);
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
      triggerConfetti();
      checkStatus(false);
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

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
  };

  if (loading) return null;
  if (!feedbackRequired && !feedbackSubmitted && !certificate) return null;

  const renderCertificatePreview = () => {
    if (certificate?.url) {
      const tokens = certificate.layout?.tokens || [];
      const rankText = certificate.rankValue || (certificate.position === 1 ? "Winner" : certificate.position === 2 ? "Runner-up" : certificate.position === 3 ? "Third Place" : "Participant");
      const valueMap: Record<string, string> = {
        $name: userName,
        $year: "Year 3",
        $rank: rankText,
        $event: eventName,
        $club: "Clubly",
        $date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      };

      const scale = imgScale.naturalWidth > 0 ? imgScale.clientWidth / imgScale.naturalWidth : 0.4;

      return (
        <div className="relative w-full overflow-hidden rounded-lg flex items-center justify-center">
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

    return null;
  };

  return (
    <>
      {/* Persistent Bottom-Right Thumbnail */}
      <AnimatePresence>
        {!isOpen && !isDismissed && (
          <motion.div
            initial={{ y: 140, x: 50, opacity: 0, rotate: 90, scale: 0.8 }}
            animate={{ y: 0, x: 0, opacity: 1, rotate: 0, scale: 1 }}
            exit={{ y: 140, x: 50, opacity: 0, rotate: 90, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 20,
              mass: 0.8,
            }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed bottom-24 right-3 sm:bottom-8 sm:right-10 lg:bottom-10 lg:right-12 z-40"
          >
            {feedbackRequired ? (
              <BorderedDiv
                style={{
                  background: `
                    radial-gradient(circle 220px at 0% 0%, rgba(186, 230, 253, 0.4) 0%, transparent 100%),
                    radial-gradient(circle 260px at 100% 100%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.75) 50%, transparent 100%),
                    #051833
                  `,
                }}
                className="group relative overflow-hidden border-[#1e3a5f] text-white p-5 rounded-2xl sm:rounded-3xl shadow-2xl w-[310px] sm:w-[325px] flex flex-col items-center text-center select-none"
              >
                {/* Grainy Noise Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                />

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={handleDismiss}
                  aria-label="Dismiss feedback prompt for this visit"
                  className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>

                <h4 className="text-white text-[14.5px] sm:text-[15.5px] font-semibold leading-snug mb-2.5 sm:mb-3 whitespace-nowrap text-center relative z-10 w-full">
                  What did you think of this event?
                </h4>

                <div className="w-full flex items-center justify-center my-2.5 sm:my-3 relative z-10">
                  <img
                    src="/images/feedback.png"
                    alt="Feedback rating stars"
                    className="w-[200px] sm:w-[220px] h-auto object-contain select-none pointer-events-none drop-shadow-md"
                  />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                  }}
                  className="w-full py-2.5 px-4 bg-[#b5b8bd] hover:bg-[#c4c7cc] active:bg-[#a6a9ae] text-gray-900 font-semibold rounded-full text-sm transition-colors duration-150 shadow-sm cursor-pointer mt-2 mb-2.5 relative z-10"
                >
                  Give feedback
                </button>

                <p className="text-[11.5px] italic text-[#959aa3] leading-snug font-normal relative z-10">
                  Provide us your valuable feedback and unlock your event certificate!
                </p>
              </BorderedDiv>
            ) : (
              <button
                onClick={() => setIsOpen(true)}
                className="group relative flex items-center justify-center p-0 rounded-lg shadow-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:rotate-[-5deg] hover:scale-110 active:scale-95 w-36 h-24 bg-black border border-zinc-800 select-none"
              >
                {certificate?.url ? (
                  <div className="w-full h-full relative overflow-hidden rounded-lg bg-black flex items-center justify-center">
                    <img
                      src={certificate.url}
                      alt="Certificate"
                      className="w-full h-full object-cover blur-[1.5px] scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center transition-opacity">
                      <Eye className="text-white w-5 h-5 mb-1 drop-shadow" />
                      <span className="text-[10.5px] font-semibold text-white tracking-wide drop-shadow">View</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#0a0b0d] rounded-lg">
                    <Award className="text-white mb-1 w-6 h-6" />
                    <span className="text-[10.5px] font-semibold text-white tracking-wide">
                      View
                    </span>
                  </div>
                )}
              </button>
            )}
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
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          >
            {feedbackRequired ? (
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 12 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="bg-[#0a0b0d] w-full max-w-lg rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04] bg-[#0a0b0d] shrink-0">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                      {eventName} Feedback
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Fill out the feedback form to unlock your event certificate!
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 overflow-y-auto bg-[#0a0b0d] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/15 hover:[&::-webkit-scrollbar-thumb]:bg-white/25 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-button]:hidden">
                  {feedbackForm ? (
                    <div className="space-y-4">
                      {feedbackForm.questions.map((q: any) => {
                        const activeRating = hoveredStars[q.id] ?? answers[q.id] ?? 0;
                        return (
                          <div key={q.id} className="bg-[#111215] border border-white/[0.04] rounded-xl p-4">
                            <p className="text-gray-200 font-medium mb-3 text-sm">
                              {q.text}
                            </p>
                            <div className="flex items-center justify-center gap-2.5 sm:gap-3 py-1">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const isFilled = activeRating >= star;
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoveredStars((prev) => ({ ...prev, [q.id]: star }))}
                                    onMouseLeave={() => setHoveredStars((prev) => ({ ...prev, [q.id]: null }))}
                                    onClick={() => handleRating(q.id, star)}
                                    className={`p-1.5 transition-transform hover:scale-110 focus:outline-none cursor-pointer ${
                                      isFilled
                                        ? "text-amber-400"
                                        : "text-zinc-700 hover:text-zinc-500"
                                    }`}
                                  >
                                    <Star
                                      size={26}
                                      className={isFilled ? "fill-amber-400" : ""}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-4 border-t border-white/[0.04] bg-[#08080a] shrink-0 flex items-center justify-center">
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={submitting}
                    className="w-auto px-6 py-2.5 bg-[#b5b8bd] hover:bg-[#c5c8cd] active:bg-[#a5a8ad] text-gray-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Direct Certificate Presentation without container box */
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 15 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="relative w-full max-w-2xl sm:max-w-3xl flex flex-col items-center justify-center"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute -top-12 right-0 sm:-right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-md z-20"
                >
                  <X size={18} />
                </button>

                {/* Certificate */}
                <div className="w-full flex items-center justify-center shadow-2xl rounded-xl overflow-hidden">
                  {renderCertificatePreview()}
                </div>

                {/* Download Button with icon */}
                <button
                  onClick={handleDownloadCertificate}
                  disabled={certDownloading}
                  className="mt-6 w-auto px-7 py-2.5 bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black font-semibold rounded-full text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xl"
                >
                  {certDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
