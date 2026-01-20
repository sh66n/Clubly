"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function Forbidden() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex flex-col p-4 bg-black text-white">
      <div className="flex-grow flex flex-col items-center justify-center rounded-xl border border-[#333] bg-black px-6 py-12 shadow-2xl">
        {/* Visual Element */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-full bg-red-500/20 blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative bg-[url(/images/403.png)] h-48 w-72 md:h-80 md:w-[480px] bg-contain bg-center bg-no-repeat mb-8" />
        </div>

        {/* Content */}
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            403
          </h1>
          <h2 className="text-xl font-semibold text-gray-200">
            Access Forbidden
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            You don't have permission to access this resource. If you believe
            this is a mistake, please contact your administrator or support.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-10 flex gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2.5 rounded-lg border border-[#333] hover:bg-[#222] transition-colors"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
