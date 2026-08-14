"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Share2,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Award,
  Calendar,
  Building2,
  User,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  ArrowUpRight,
  Globe,
  X
} from "lucide-react";
import { FaWhatsapp, FaLinkedinIn, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";

interface PublicCertificateViewerProps {
  eventId: string;
  eventName: string;
  recipientName: string;
  recipientImage?: string;
  eventImage?: string;
  registrationFee?: number;
  clubName: string;
  clubLogo?: string;
  issueDate: string;
  issueYear: number;
  issueMonth: number;
  rankValue: string;
  certificateUrl: string;
  layout: any;
  userId?: string;
  currentUserId?: string;
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

export default function PublicCertificateViewer({
  eventId,
  eventName,
  recipientName,
  recipientImage,
  eventImage,
  registrationFee = 0,
  clubName,
  clubLogo,
  issueDate,
  issueYear,
  issueMonth,
  rankValue,
  certificateUrl,
  layout,
  userId,
  currentUserId,
}: PublicCertificateViewerProps) {
  const isOwner =
    currentUserId &&
    userId &&
    String(currentUserId).trim().toLowerCase() === String(userId).trim().toLowerCase();
  const [imgScale, setImgScale] = useState<{ clientWidth: number; naturalWidth: number }>({
    clientWidth: 750, naturalWidth: 1920
  });
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  useEffect(() => {
    if (layout?.tokens) {
      layout.tokens.forEach((t: any) => {
        if (t.fontFamily) loadGoogleFont(t.fontFamily);
      });
    }
  }, [layout]);

  // Window resize handler to scale certificate overlays correctly
  useEffect(() => {
    const handleResize = () => {
      const img = document.getElementById("cert-img-renderer") as HTMLImageElement;
      if (img && img.clientWidth > 0) {
        setImgScale({
          clientWidth: img.clientWidth,
          naturalWidth: img.naturalWidth || 1920
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const publicCertUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/certificates/${eventId}${userId ? `?user=${userId}` : ""}`
    : `/certificates/${eventId}`;

  const linkedInAddToProfileUrl = (() => {
    const params = new URLSearchParams();
    params.set("startTask", "CERTIFICATION_NAME");
    params.set("name", `${eventName} Certificate`);
    params.set("organizationName", clubName || "Clubly");
    params.set("issueYear", String(issueYear));
    params.set("issueMonth", String(issueMonth));
    params.set("certUrl", publicCertUrl);
    params.set("certId", `CLUBLY-${eventId.slice(-6).toUpperCase()}`);
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  })();

  const generateCertificateImageBlob = async (): Promise<Blob | null> => {
    if (!certificateUrl) return null;

    return new Promise(async (resolve) => {
      try {
        const tokens = layout?.tokens || [];
        const valueMap: Record<string, string> = {
          $name: recipientName,
          $year: "Year 3",
          $rank: rankValue,
          $event: eventName,
          $club: clubName,
          $date: issueDate,
        };

        if (typeof document !== "undefined" && document.fonts) {
          const fontPromises = tokens.map(async (token: any) => {
            if (token.fontFamily) {
              loadGoogleFont(token.fontFamily);
              try {
                await document.fonts.load(
                  `${token.italic ? "italic " : ""}${token.bold ? "bold " : ""}${token.fontSize || 44}px "${token.fontFamily}"`
                );
              } catch (_) {}
            }
          });
          await Promise.all(fontPromises);
          await document.fonts.ready;
        }

        const renderCanvas = (img: HTMLImageElement) => {
          const width = img.naturalWidth || 1920;
          const height = img.naturalHeight || 1080;
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          tokens.forEach((token: any) => {
            const rawText =
              valueMap[token.variable] ??
              (token.variable?.startsWith("$") ? token.variable.slice(1) : token.variable);
            const text = String(rawText || "");
            const fontSize = token.fontSize || 44;
            const fontName = token.fontFamily ? `"${token.fontFamily}", sans-serif` : "Helvetica, Arial, sans-serif";
            const fontStyle = token.italic ? "italic " : "";
            const fontWeight = token.bold ? "bold " : "normal ";

            ctx.font = `${fontStyle}${fontWeight}${fontSize}px ${fontName}`;
            ctx.fillStyle = token.colorHex || "#111111";
            ctx.textAlign = token.align === "left" ? "left" : token.align === "right" ? "right" : "center";
            ctx.textBaseline = "middle";

            const tokenX = token.x ?? 0.5;
            const tokenY = token.y ?? 0.5;
            const posX = tokenX * width;
            const posY = (1 - tokenY) * height;

            ctx.fillText(text, posX, posY);
          });

          canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
        };

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => renderCanvas(img);
        img.onerror = async () => {
          try {
            const res = await fetch(certificateUrl);
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
              renderCanvas(fallbackImg);
              URL.revokeObjectURL(objectUrl);
            };
            fallbackImg.onerror = () => {
              URL.revokeObjectURL(objectUrl);
              resolve(null);
            };
            fallbackImg.src = objectUrl;
          } catch {
            resolve(null);
          }
        };
        img.src = certificateUrl;
      } catch (err) {
        console.error("Canvas error:", err);
        resolve(null);
      }
    });
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicCertUrl);
      }
      setIsCopied(true);
      toast.success("Certificate link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleCopyImage = async () => {
    setIsExporting(true);
    try {
      const blob = await generateCertificateImageBlob();
      if (!blob) throw new Error("Could not render certificate image");

      if (typeof window !== "undefined" && window.ClipboardItem && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setIsImageCopied(true);
        toast.success("Certificate image copied! Press Ctrl+V to paste.");
        setTimeout(() => setIsImageCopied(false), 3000);
      } else {
        handleDownloadPng();
      }
    } catch (err) {
      handleDownloadPng();
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const blob = await generateCertificateImageBlob();
      if (!blob) throw new Error("Could not export image");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${eventName}-Certificate.png`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      toast.success("Certificate image saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to download image");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsPdfDownloading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/certificate${userId ? `?user=${userId}` : ""}`);
      if (!res.ok) {
        await handleDownloadPng();
        return;
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
      toast.success("Certificate PDF downloaded!");
    } catch {
      await handleDownloadPng();
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const handleShare = async (platform: "whatsapp" | "linkedin" | "instagram" | "twitter" | "native") => {
    const shareText = `🎓 Verified Certificate awarded to ${recipientName} for participating in ${eventName} on Clubly! Check it out:`;

    if (platform === "native" && navigator.share) {
      try {
        await navigator.share({
          title: `${eventName} Certificate - ${recipientName}`,
          text: shareText,
          url: publicCertUrl,
        });
        toast.success("Shared successfully!");
        setIsShareMenuOpen(false);
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") toast.error("Could not share");
        return;
      }
    }

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${publicCertUrl}`)}`, "_blank");
      setIsShareMenuOpen(false);
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicCertUrl)}`, "_blank");
      setIsShareMenuOpen(false);
    } else if (platform === "instagram") {
      window.open("https://www.instagram.com/", "_blank");
      setIsShareMenuOpen(false);
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(publicCertUrl)}`, "_blank");
      setIsShareMenuOpen(false);
    }
  };

  const tokens = layout?.tokens || [];
  const valueMap: Record<string, string> = {
    $name: recipientName,
    $year: "Year 3",
    $rank: rankValue,
    $event: eventName,
    $club: clubName,
    $date: issueDate,
  };
  const scale = imgScale.naturalWidth > 0 ? imgScale.clientWidth / imgScale.naturalWidth : 0.4;

  return (
    <div className="flex flex-col min-h-screen bg-[#0c0d12] text-[#f3f4f6]">
      {/* Clubly Premium Dark Header */}
      <header className="sticky top-0 z-[50] flex items-center justify-between h-[72px] px-6 bg-[#0c0d12]/80 backdrop-blur-md border-b border-white/[0.06] text-sm select-none">
        <div className="flex items-center gap-4 flex-1">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/images/logo.png" className="h-8 w-auto" alt="Clubly logo" />
          </Link>
        </div>

        {/* Right Nav Options */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href={`/events/${eventId}`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <span>View Event</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </header>

      {/* Main Layout Area: Grid layout for side-by-side 70/30 view on desktop */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-8 flex-1 flex flex-col lg:flex-row gap-8 items-start">
        {/* Certificate Document Viewer (Takes 70% of space) */}
        <div className="w-full lg:w-[70%] flex flex-col">
          {/* Certificate Container: Transparent background, no border-radius */}
          <div className="border border-white/[0.08] bg-transparent p-1.5 md:p-3 shadow-2xl rounded-none">
            <div className="relative w-full h-auto overflow-hidden">
              <img
                id="cert-img-renderer"
                src={certificateUrl}
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
                const text =
                  valueMap[token.variable] ??
                  (token.variable?.startsWith("$") ? token.variable.slice(1) : token.variable);
                const tokenX = token.x ?? 0.5;
                const tokenY = token.y ?? 0.5;
                const topPct = (1 - tokenY) * 100;
                const leftPct = tokenX * 100;

                const transformOrigin =
                  token.align === "left"
                    ? "translate(0%, -50%)"
                    : token.align === "right"
                    ? "translate(-100%, -50%)"
                    : "translate(-50%, -50%)";
                const calculatedFontSize = Math.max(8, Math.round((token.fontSize || 44) * scale));

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
                    className="whitespace-nowrap pointer-events-none select-none"
                  >
                    {text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Paragraph text */}
          <div className="mt-6 text-sm text-zinc-400 leading-relaxed border-t border-white/[0.06] pt-6">
            This certificate above verifies that <span className="font-semibold text-white">{recipientName}</span> successfully participated in and completed the event <span className="font-semibold text-white">{eventName}</span> on <span className="font-semibold text-white">{issueDate}</span> organized by <span className="font-semibold text-white">{clubName}</span> as verified on Clubly. The certificate indicates that the participant attended all required rounds and met the completion criteria as validated by the organizing committee of the club.
          </div>
        </div>

        {/* Sidebar Info Section (Takes 30% of space, in one line alongside the certificate) */}
        <div className="w-full lg:w-[30%] flex flex-col gap-8">
          {/* Section: Certificate Recipient */}
          <div className="flex flex-col">
            <span className="text-[12.5px] font-bold text-zinc-500 tracking-wide uppercase mb-2.5">
              Certificate Recipient:
            </span>
            <div className="flex items-center gap-3">
              {recipientImage ? (
                <img
                  src={recipientImage}
                  alt={recipientName}
                  className="w-[50px] h-[50px] rounded-full object-cover border border-white/[0.08]"
                />
              ) : (
                <div className="w-[50px] h-[50px] rounded-full bg-white/5 text-white flex items-center justify-center border border-white/[0.08]">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="font-bold text-white text-base leading-tight">
                {recipientName}
              </span>
            </div>
          </div>

          {/* Section: About the Event (No container box) */}
          <div className="flex flex-col">
            <span className="text-[12.5px] font-bold text-zinc-500 tracking-wide uppercase mb-2.5">
              About the Event:
            </span>
            
            {/* Event Details directly rendered without wrapper container card (responsive layout) */}
            <div className="flex flex-col">
              <div className="flex flex-row lg:flex-col gap-4 items-start lg:items-stretch">
                {/* Event Image */}
                {eventImage ? (
                  <img
                    src={eventImage}
                    alt={eventName}
                    className="w-24 h-16 lg:w-full lg:max-w-[320px] lg:h-auto lg:aspect-video object-cover rounded-lg border border-white/[0.06] shrink-0"
                  />
                ) : (
                  <div className="w-24 h-16 lg:w-full lg:max-w-[320px] lg:aspect-video rounded-lg bg-gradient-to-br from-[#2e1065] to-black border border-white/[0.06] flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 lg:w-8 lg:h-8 text-white/30" />
                  </div>
                )}

                {/* Event Title & Organized Info */}
                <div className="flex flex-col">
                  <span className="font-bold text-white text-base leading-snug hover:text-zinc-300 transition-colors cursor-pointer">
                    {eventName}
                  </span>
                  <span className="text-xs text-zinc-400 mt-0.5 lg:mt-1 lg:mb-1.5">
                    Organized by <span className="font-medium text-white">{clubName}</span>
                  </span>
                  <span className="text-[11.5px] text-zinc-400 mt-1 lg:mt-0 flex items-center gap-1.5 lg:mb-3">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Issued on {issueDate}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons: Conditional based on ownership */}
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Download PDF Button */}
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isPdfDownloading}
                    className="w-fit min-w-[120px] px-5 py-2.5 bg-white text-black hover:bg-zinc-200 active:bg-zinc-300 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isPdfDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Download</span>
                  </button>

                  {/* Share Button (Only for Certificate Owner) */}
                  {isOwner && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsShareMenuOpen((prev) => !prev)}
                        className="w-fit min-w-[120px] px-5 py-2.5 border border-white/20 text-white hover:bg-white/5 active:bg-white/10 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>

                      <AnimatePresence>
                        {isShareMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsShareMenuOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.92, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: 10 }}
                              className="absolute left-0 bottom-full mb-3.5 z-50 w-72 sm:w-80 bg-[#121318]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl text-white"
                            >
                              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.08]">
                                <span className="text-xs font-bold text-white">Share Certificate</span>
                                <button
                                  type="button"
                                  onClick={() => setIsShareMenuOpen(false)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-4 gap-2 mb-3">
                                <button
                                  onClick={() => handleShare("whatsapp")}
                                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-[#25D366]/20 transition-all cursor-pointer"
                                >
                                  <FaWhatsapp size={18} className="text-[#25D366]" />
                                  <span className="text-[11px] text-gray-300">WhatsApp</span>
                                </button>
                                <button
                                  onClick={() => handleShare("linkedin")}
                                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-[#0A66C2]/20 transition-all cursor-pointer"
                                >
                                  <FaLinkedinIn size={16} className="text-[#0A66C2]" />
                                  <span className="text-[11px] text-gray-300">LinkedIn</span>
                                </button>
                                <button
                                  onClick={() => handleShare("instagram")}
                                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-[#E1306C]/20 transition-all cursor-pointer"
                                >
                                  <FaInstagram size={17} className="text-[#E1306C]" />
                                  <span className="text-[11px] text-gray-300">Instagram</span>
                                </button>
                                <button
                                  onClick={() => handleShare("twitter")}
                                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/20 transition-all cursor-pointer"
                                >
                                  <FaXTwitter size={15} className="text-white" />
                                  <span className="text-[11px] text-gray-300">Twitter</span>
                                </button>
                              </div>

                              <div className="flex items-center gap-2 p-1.5 pl-2.5 bg-black/50 border border-white/10 rounded-xl">
                                <span className="text-[10px] text-zinc-400 truncate flex-1 font-mono">
                                  {publicCertUrl}
                                </span>
                                <button
                                  type="button"
                                  onClick={handleCopyLink}
                                  className="shrink-0 px-2.5 py-1 rounded bg-white text-black hover:bg-zinc-200 text-[11px] font-bold transition-colors"
                                >
                                  {isCopied ? "Copied" : "Copy"}
                                </button>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Update Name Link (Only for Certificate Owner) */}
                {isOwner && (
                  <p className="text-sm text-zinc-400 leading-relaxed mt-2 select-none">
                    <Link href="/settings" className="text-white font-bold hover:underline">
                      Update your certificate
                    </Link>{" "}
                    with your correct name or preferred language
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
