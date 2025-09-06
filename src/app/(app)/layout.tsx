import React from "react";
import { Toaster } from "sonner";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Toaster
        position="bottom-right"
        expand={false}
        toastOptions={{
          style: {
            background: "black",
            color: "white",
            border: "none",
          },
        }}
      />

      <div className="relative min-h-screen h-full flex-grow pt-4 pr-4 pb-4">
        <div className="h-full rounded-lg p-10 pb-4 border border-[#515151] relative bg-[url(/images/lb-bg.png)] bg-cover bg-top bg-no-repeat">
          {children}
        </div>
      </div>
    </>
  );
}
