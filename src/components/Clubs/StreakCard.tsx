"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, X } from "lucide-react";
import { Caveat } from "next/font/google";


const handwritingFont = Caveat({
  subsets: ["latin"],
  weight: ["700"],
});

interface Sticker {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventImage: string | null;
  numberOfWinners?: number;
  badgeType: "participation" | "winner" | "winner_1" | "winner_2" | "winner_3" | null;
}

interface StreakCardData {
  config: {
    cardFrontImage: string;
    cardBackImage: string;
    gridColumns: number;
  };
  studentName: string;
  stickers: Sticker[];
}

interface StreakCardProps {
  clubId: string;
}

export default function StreakCard({ clubId }: StreakCardProps) {
  const [data, setData] = useState<StreakCardData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch(`/api/clubs/${clubId}/features/streak-card`)
      .then((res) => {
        if (!res.ok) throw new Error("not-available");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("not-available"))
      .finally(() => setLoading(false));
  }, [clubId]);

  if (!mounted || loading || error || !data) return null; // Don't render anything if not available

  return (
    <>
      <style>{`
        @keyframes spinBadge {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes badgeShine {
          0% { transform: translateX(-150%) skewX(-30deg); opacity: 0; }
          10% { opacity: 0.5; }
          20% { transform: translateX(150%) skewX(-30deg); opacity: 0; }
          100% { transform: translateX(150%) skewX(-30deg); opacity: 0; }
        }
      `}</style>

      {/* Full Screen Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={() => {
              setIsExpanded(false);
              setIsFlipped(false);
            }}
          >
            <motion.div
              className="relative w-[88vw] max-w-[380px] aspect-[7/10] max-h-[74vh]"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            >
              {/* Close Button */}
              <button
                className="absolute -top-11 right-0 sm:-top-12 sm:right-0 p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors z-20 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                  setIsFlipped(false);
                }}
                aria-label="Close Streak Card"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>

              <motion.div
                className="w-full h-full [transform-style:preserve-3d] cursor-pointer"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(!isFlipped);
                }}
              >
                {/* FRONT */}
                <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl overflow-hidden shadow-2xl">
                  <img src={data.config.cardFrontImage} className="w-full h-full object-cover" />
                  <div className="absolute bottom-[7.2%] left-1/2 -translate-x-1/2 w-[68%] h-[7.5%] flex items-center justify-center px-2 sm:px-3">
                    <span className={`${handwritingFont.className} text-[#100720] font-bold text-xl sm:text-2xl md:text-3xl tracking-wide text-center line-clamp-1 break-words`}>
                      {data.studentName}
                    </span>
                  </div>
                </div>
                
                {/* BACK */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden shadow-2xl">
                  <img src={data.config.cardBackImage} className="w-full h-full object-cover" />
                  
                  {/* Perfectly aligned 3x3 grid over the cards on streak-card-back.jpg */}
                  <div className="absolute top-[17.5%] bottom-[4.5%] left-[4.8%] right-[4.8%] grid grid-cols-3 grid-rows-3 gap-x-[3.8%] gap-y-[2.8%] overflow-hidden">
                    {Array.from({ length: 9 }).map((_, idx) => {
                      const sticker = data.stickers[idx];
                      return (
                        <StickerSlot key={sticker ? sticker.eventId : `empty-${idx}`} sticker={sticker} index={idx} />
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Tap hint */}
              <p className="absolute -bottom-10 sm:-bottom-12 left-1/2 -translate-x-1/2 text-center text-xs sm:text-sm font-bold text-white/90 drop-shadow-md bg-black/40 sm:bg-white/10 rounded-full py-1.5 sm:py-2 px-4 sm:px-6 backdrop-blur-md whitespace-nowrap shadow-lg">
                Tap to {isFlipped ? "see front" : "see stickers"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small Floating Preview (positioned above mobile nav bar on phones) */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 cursor-pointer"
            whileHover={{ scale: 1.06, rotate: -3 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsExpanded(true)}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="relative w-[75px] h-[107px] md:w-[100px] md:h-[142px] rounded-xl overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.4)] border-2 border-white/30">
              <img src={data.config.cardFrontImage} className="w-full h-full object-cover" />
              <div className="absolute bottom-[7.2%] left-1/2 -translate-x-1/2 w-[68%] h-[7.5%] flex items-center justify-center px-1">
                <span className={`${handwritingFont.className} text-[#100720] font-bold text-[8px] md:text-xs tracking-wide text-center line-clamp-1 break-words`}>
                  {data.studentName}
                </span>
              </div>
            </div>
            
            <div className="absolute -top-2.5 -right-2.5 md:-top-3 md:-right-3 bg-blue-600 text-white text-[9px] md:text-[11px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-lg border border-white/30">
              Streak!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StickerSlot({ sticker, index }: { sticker?: Sticker; index: number }) {
  if (!sticker || !sticker.badgeType) {
    // Empty slot — no badge yet
    return <div className="w-full h-full" />;
  }

  const badgeType = sticker.badgeType;
  const isWinner = badgeType?.startsWith("winner");
  
  let edgeColor = "bg-[#78716c] border-[#57534e]";
  let frontColor = "border-stone-400 ring-stone-200/90 bg-gradient-to-tr from-[#d6d3d1] via-[#f5f5f4] to-[#a8a29e] shadow-[0_4px_10px_rgba(0,0,0,0.15)]";
  let backColor = "border-stone-400 ring-stone-200/90 bg-gradient-to-bl from-[#d6d3d1] via-[#f5f5f4] to-[#a8a29e] shadow-[0_4px_10px_rgba(0,0,0,0.15)]";
  let textColorFront = "text-stone-800";
  let textColorBack = "text-stone-900";
  let iconColor = "text-stone-700";
  let badgeLabel = "Participant";

  if (badgeType === "winner" || badgeType === "winner_1") {
    // Gold
    edgeColor = "bg-[#b45309] border-[#92400e]";
    frontColor = "border-amber-500 ring-amber-200/90 bg-gradient-to-tr from-[#f59e0b] via-[#fef08a] to-[#d97706] shadow-[0_0_12px_rgba(245,158,11,0.6)]";
    backColor = "border-amber-500 ring-amber-200/90 bg-gradient-to-bl from-[#f59e0b] via-[#fef08a] to-[#d97706] shadow-[0_0_12px_rgba(245,158,11,0.6)]";
    textColorFront = "text-amber-950";
    textColorBack = "text-amber-950";
    iconColor = "text-amber-900";
    badgeLabel = "Winner";
  } else if (badgeType === "winner_2") {
    // Crisp Metallic Silver
    edgeColor = "bg-[#475569] border-[#334155]";
    frontColor = "border-slate-300 ring-white/90 bg-gradient-to-tr from-[#94a3b8] via-[#ffffff] to-[#64748b] shadow-[0_0_12px_rgba(203,213,225,0.7)]";
    backColor = "border-slate-300 ring-white/90 bg-gradient-to-bl from-[#94a3b8] via-[#ffffff] to-[#64748b] shadow-[0_0_12px_rgba(203,213,225,0.7)]";
    textColorFront = "text-slate-900";
    textColorBack = "text-slate-900";
    iconColor = "text-slate-800";
    badgeLabel = sticker.numberOfWinners === 2 ? "Runner Up" : "2nd Place";
  } else if (badgeType === "winner_3") {
    // Bronze
    edgeColor = "bg-[#9a3412] border-[#7c2d12]";
    frontColor = "border-orange-500 ring-orange-200/90 bg-gradient-to-tr from-[#ea580c] via-[#fed7aa] to-[#c2410c] shadow-[0_0_12px_rgba(234,88,12,0.6)]";
    backColor = "border-orange-500 ring-orange-200/90 bg-gradient-to-bl from-[#ea580c] via-[#fed7aa] to-[#c2410c] shadow-[0_0_12px_rgba(234,88,12,0.6)]";
    textColorFront = "text-orange-950";
    textColorBack = "text-orange-950";
    iconColor = "text-orange-900";
    badgeLabel = "3rd Place";
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-between overflow-hidden">
      {/* 1. Handwritten Event Name ABOVE the printed card line */}
      <div className="w-full h-[21%] flex items-center justify-center px-0.5 sm:px-1">
        <span
          className={`${handwritingFont.className} text-[#100720] text-[9px] sm:text-[12px] md:text-[13px] font-bold text-center line-clamp-1 leading-none drop-shadow-sm`}
        >
          {sticker.eventName}
        </span>
      </div>

      {/* 2. 3D Spinning Coin Badge in the main slot below the line */}
      <div className="w-full h-[79%] flex items-center justify-center pb-1 [perspective:600px]">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: index * 0.08, bounce: 0.5 }}
          className="relative w-[72%] aspect-square [transform-style:preserve-3d] animate-[spinBadge_3.5s_linear_infinite]"
          style={{
            animationDelay: `${(index % 3) * 0.4}s`,
          }}
        >
          {/* 3D Coin Edge / Thickness Layers (Extrusion) */}
          {[-2, -1.2, -0.4, 0.4, 1.2, 2].map((zOffset, i) => (
            <div
              key={i}
              className={`absolute inset-0 rounded-full border-2 sm:border-[3px] ${edgeColor}`}
              style={{
                transform: `translateZ(${zOffset}px)`,
              }}
            />
          ))}

          {/* Front of Coin (Pushed Forward) */}
          <div
            className={`absolute inset-0 rounded-full border-2 sm:border-[3px] ring-1 sm:ring-2 ring-inset flex flex-col items-center justify-center p-0.5 sm:p-1 shadow-lg [backface-visibility:hidden] overflow-hidden ${frontColor}`}
            style={{
              transform: "translateZ(2.5px)",
            }}
          >
            {isWinner ? (
              <Trophy className={`${iconColor} mb-0.5 w-3 h-3 sm:w-4 sm:h-4 relative z-10`} />
            ) : (
              <Award className={`${iconColor} mb-0.5 w-3 h-3 sm:w-4 sm:h-4 relative z-10`} />
            )}
            <span
              className={`text-[5px] sm:text-[6.5px] font-black uppercase tracking-tight text-center leading-[1.05] relative z-10 ${textColorFront}`}
            >
              {badgeLabel}
              <br />
              Badge
            </span>

            {/* Shine Animation */}
            {isWinner && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                <div 
                  className="absolute top-0 bottom-0 w-1/2 bg-white/50 blur-sm animate-[badgeShine_3s_ease-in-out_infinite]"
                  style={{ animationDelay: `${(index % 3) * 0.4}s` }}
                />
              </div>
            )}
          </div>

          {/* Back of Coin with standard clean font (Pushed Backward) */}
          <div
            className={`absolute inset-0 rounded-full border-2 sm:border-[3px] ring-1 sm:ring-2 ring-inset flex flex-col items-center justify-center p-0.5 sm:p-1.5 shadow-lg [backface-visibility:hidden] overflow-hidden ${backColor}`}
            style={{
              transform: "translateZ(-2.5px) rotateY(180deg)",
            }}
          >
            <span
              className={`font-black uppercase text-[6.5px] sm:text-[8px] md:text-[8.5px] tracking-tight text-center line-clamp-3 leading-tight px-0.5 relative z-10 ${textColorBack}`}
            >
              {sticker.eventName}
            </span>

            {/* Shine Animation Back */}
            {isWinner && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                <div 
                  className="absolute top-0 bottom-0 w-1/2 bg-white/50 blur-sm animate-[badgeShine_3s_ease-in-out_infinite]"
                  style={{ animationDelay: `${((index % 3) * 0.4) + 1.5}s` }} // offset the back shine
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
