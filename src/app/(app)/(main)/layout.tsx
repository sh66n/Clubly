import React from "react";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* md and above */}
      <div className="relative min-h-screen h-full flex-grow pt-4 pr-4 pb-4 hidden md:block">
        <div className="h-full rounded-lg p-10 pb-4 border border-[#515151] relative bg-[url(/images/bg.png)] bg-cover bg-top bg-no-repeat">
          {children}
        </div>
      </div>

      {/* below md */}
      <div className="relative min-h-screen h-full flex-grow pt-4 pr-4 pb-4 block md:hidden p-5">
        {children}
      </div>
    </>
  );
}
