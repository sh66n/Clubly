import React from "react";

interface BorderedDivProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export default function BorderedDiv({
  children,
  className = "",
  ...props
}: BorderedDivProps) {
  return (
    <div
      className={`bg-black border border-[#515151] rounded-lg p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

