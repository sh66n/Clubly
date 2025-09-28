import React, { ReactNode } from "react";

interface FeatureCardProps {
  children: ReactNode;
}

export function FeatureCard({ children }: FeatureCardProps) {
  return (
    <div className="group relative border border-[#515151] rounded-xl px-4 py-4 flex flex-col gap-2 pb-32 overflow-hidden transition-colors duration-500 hover:border-transparent">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-[url(/images/card-bg.png)] bg-cover bg-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 "></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function Number({ children }: { children: ReactNode }) {
  return (
    <div className="heading text-xl text-[#5E77F5] mb-8 transition-all duration-300 group-hover:text-white">
      {children}
    </div>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <div className="text-lg mb-1 transition-all duration-300 group-hover:text-white">
      {children}
    </div>
  );
}

export function Description({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-extralight transition-all duration-300 group-hover:text-white">
      {children}
    </div>
  );
}
