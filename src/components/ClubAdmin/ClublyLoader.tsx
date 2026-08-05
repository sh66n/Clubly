import React from "react";

export default function ClublyLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] select-none animate-in fade-in duration-500">
      {/* Brand typographic container with single active pulsing dot */}
      <div className="flex items-baseline gap-0.5 mb-3">
        <span className="text-xl font-bold tracking-tight text-slate-800">
          clubly
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#7CB342] animate-ping duration-1000" />
      </div>

      {/* Ultra thin elegant indicator line */}
      <div className="w-24 h-[2px] bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#7CB342] rounded-full animate-[loading_1.5s_infinite_ease-in-out]" />
      </div>

      <style jsx global>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
