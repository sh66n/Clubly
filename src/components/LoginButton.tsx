"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginButton() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("google", {
      callbackUrl: searchParams.get("callbackUrl") ?? "/dashboard",
    });
  };

  return (
    <div className="flex justify-center w-full">
      <button
        onClick={handleSignIn}
        disabled={loading}
        className={`
          group flex items-center justify-center gap-3 w-full px-6 py-3 
          bg-[#121212] hover:bg-[#1a1a1a] 
          border border-white/10 hover:border-white/20
          text-white font-medium rounded-xl
          transition-all duration-200 ease-in-out
          ${loading ? "cursor-not-allowed opacity-70" : "active:scale-[0.98] shadow-xl"}
        `}
      >
        {loading ? (
          <svg
            className="w-5 h-5 animate-spin text-white/50"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M533.5 278.4c0-17.8-1.5-35-4.4-51.7H272v97.9h146.9c-6.4 34.5-25.7 63.8-54.6 83.5v69.2h88.3c51.7-47.7 81.9-118 81.9-198.9z"
              fill="#4285F4"
            />
            <path
              d="M272 544.3c73.6 0 135.4-24.5 180.5-66.5l-88.3-69.2c-24.6 16.5-56.2 26.2-92.2 26.2-70.9 0-131-47.8-152.5-112.1H28.9v70.4C74 482.5 167 544.3 272 544.3z"
              fill="#34A853"
            />
            <path
              d="M119.5 328.1c-9.8-29.3-9.8-61 0-90.3v-70.4H28.9c-39.5 77.7-39.5 170.2 0 247.9l90.6-70.4z"
              fill="#FBBC05"
            />
            <path
              d="M272 107.7c38.7 0 73.5 13.3 101 39.5l75.7-75.7C407.3 24.5 345.6 0 272 0 167 0 74 61.8 28.9 151.7l90.6 70.4C141 155.5 201.1 107.7 272 107.7z"
              fill="#EA4335"
            />
          </svg>
        )}

        <span className="text-sm">
          {loading ? "Signing in..." : "Sign in with Google"}
        </span>
      </button>
    </div>
  );
}