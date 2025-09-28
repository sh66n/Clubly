import React from "react";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full flex flex-col">
      <h1 className="text-5xl font-semibold">Leaderboard</h1>
      <div className="mt-2 text-[#717171]">
        Your efforts, ranked and recognized.
      </div>
      {children}
    </div>
  );
}
