"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Join code copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full group">
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-between bg-[#0A0A0A] p-4 rounded-lg border border-[#1A1A1A] hover:border-[#333] transition-all duration-300 group/btn"
      >
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">
            Join Code
          </span>
          <code className="text-xl font-mono font-bold text-white tracking-[0.3em]">
            {code || "------"}
          </code>
        </div>

        <div
          className={`p-2.5 rounded-xl transition-all duration-300 ${
            copied
              ? "bg-green-500/10 text-green-500"
              : "bg-white/5 text-gray-500 group-hover/btn:text-white group-hover/btn:bg-white/10"
          }`}
        >
          {copied ? (
            <Check size={18} strokeWidth={2.5} />
          ) : (
            <Copy size={18} strokeWidth={2.5} />
          )}
        </div>
      </button>

      {/* Subtle bottom shadow/glow for depth on dark background */}
      <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}
