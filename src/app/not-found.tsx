"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="bg-[url(/images/404.png)] h-40 w-60 md:h-80 md:w-120 bg-contain bg-center bg-no-repeat"></div>
      <h1 className="text-lg mb-2">Page not found</h1>

      <p className="text-xs">The page you’re looking for could not be found.</p>
    </div>
  );
}
