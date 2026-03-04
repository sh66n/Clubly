import LoginButton from "@/components/LoginButton";
import LoginErrorToast from "@/components/LoginErrorToast";
import React from "react";

export default async function Login() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex items-center justify-center p-6">
      <LoginErrorToast />

      {/* Main Container */}
      <div className="w-full max-w-md space-y-8 flex flex-col">
        {/* Header Section */}
        <div className="space-y-2 text-left md:text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-[#a1a1a1] bg-clip-text text-transparent">
            Get started with Clubly
          </h1>
          <p className="text-[#717171] text-lg">
            Login to your account to continue.
          </p>
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-center justify-center py-10 border border-white/5 bg-white/[0.02] rounded-2xl backdrop-blur-sm">
          <div className="w-full max-w-[280px]">
            <LoginButton />
          </div>

          <p className="mt-6 text-xs text-[#4a4a4a] text-center px-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        {/* Subtle Footer (Optional) */}
        <div className="text-center">
          <span className="text-sm text-[#4a4a4a]">© 2026 Clubly Inc.</span>
        </div>
      </div>
    </div>
  );
}
