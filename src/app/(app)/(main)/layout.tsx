import React from "react";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* md and above */}
      <div className="relative min-h-screen flex-grow pt-4 pr-4 pb-4 hidden md:flex">
        <div className="flex-1 rounded-lg p-10 pb-4 border border-[#515151] relative bg-[url(/images/bg.png)] bg-cover bg-top bg-no-repeat">
          {children}
        </div>
      </div>

      {/* below md */}
      <div className="relative min-h-screen h-full w-full flex-grow block md:hidden p-3 sm:p-4">
        {children}
      </div>
    </>
  );
}
