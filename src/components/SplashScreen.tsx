"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [shouldUnmount, setShouldUnmount] = useState(false);

  useEffect(() => {
    // We only want to set it if it's not already set.
    const alreadySeen = sessionStorage.getItem("hasSeenSplash");
    if (alreadySeen) {
      setShouldUnmount(true);
    } else {
      // We set it so next reloads will know
      sessionStorage.setItem("hasSeenSplash", "true");
    }
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
      <video
        autoPlay
        muted
        playsInline
        onEnded={() => setIsAnimatingOut(true)}
        className="w-full max-w-none md:max-w-3xl scale-[1.8] md:scale-100 translate-x-[19px] md:translate-x-0 object-contain"
      >
        <source src="/videos/splash.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
