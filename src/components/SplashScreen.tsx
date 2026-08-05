"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [shouldUnmount, setShouldUnmount] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("hasSeenSplash");
    if (alreadySeen) {
      setShouldUnmount(true);
      return;
    }

    sessionStorage.setItem("hasSeenSplash", "true");

    // Trigger slide-up exit after the intro animation completes + brief hold
    // Logo intro: 0s–0.8s, text reveal: 0.8s–1.4s, hold: ~0.6s → exit at ~2.0s
    const timer = setTimeout(() => {
      setIsAnimatingOut(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (shouldUnmount) return null;

  return (
    <div
      id="splash-screen"
      onTransitionEnd={() => isAnimatingOut && setShouldUnmount(true)}
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-transform duration-700 ease-in-out ${
        isAnimatingOut ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center justify-center">
        {/* Logo — starts fully invisible via inline style to prevent flash */}
        <img
          src="/images/logo-without-text.png"
          alt="Clubly Logo"
          style={{ opacity: 0, transform: "scale(0.6)" }}
          className="h-20 w-20 object-contain logo-animate"
        />

        {/* Text container — overflow-x only so descenders (y) aren't clipped */}
        <div
          style={{ maxWidth: 0, opacity: 0, marginLeft: 0 }}
          className="text-container-animate overflow-hidden whitespace-nowrap pb-1"
        >
          <h1 style={{ color: "#ffffff" }} className="text-5xl font-bold">Clubly</h1>
        </div>
      </div>

      <style jsx global>{`
        .logo-animate {
          animation: logo-intro 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .text-container-animate {
          animation: text-reveal 0.9s cubic-bezier(0.33, 1, 0.68, 1) forwards;
          animation-delay: 0.85s;
        }

        @keyframes logo-intro {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes text-reveal {
          0% {
            max-width: 0;
            margin-left: 0;
            opacity: 0;
          }
          100% {
            max-width: 280px;
            margin-left: 1.25rem;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
