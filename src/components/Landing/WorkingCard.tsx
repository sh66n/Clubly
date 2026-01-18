import React from "react";

interface WorkingCardProps {
  children?: React.ReactNode;
}

export function WorkingCard({ children }: WorkingCardProps) {
  const numberChild = React.Children.toArray(children).find(
    (child: any) => child.type?.displayName === "Number",
  );
  const workingChild = React.Children.toArray(children).find(
    (child: any) => child.type?.displayName === "Working",
  );

  return (
    <div className="group relative h-60 w-60 md:h-80 md:w-80 rounded-full text-center border border-[#515151] overflow-hidden transition-colors duration-700 hover:border-transparent">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-[url(/images/card-bg.png)] bg-cover bg-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      {/* Number at top */}
      <div className="relative z-10 pt-6">{numberChild}</div>

      {/* Working perfectly centered */}
      <div className="absolute inset-0 flex items-center justify-center z-10 px-2">
        {workingChild}
      </div>
    </div>
  );
}

export function Number({ children }: { children: React.ReactNode }) {
  return (
    <div className="heading text-[#5E77F5] transition-all duration-300 group-hover:text-white text-lg md:text-xl">
      {children}
    </div>
  );
}
Number.displayName = "Number";

export function Working({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm md:text-lg transition-all duration-300 group-hover:text-white">
      {children}
    </div>
  );
}
Working.displayName = "Working";
