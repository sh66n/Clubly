import React from "react";

export default function BorderedDiv({
  children,
  className = "",
}: Readonly<{
  children?: React.ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={`bg-black border border-[#515151] rounded-lg p-4 ${className}`}
    >
      {children}
    </div>
  );
}
