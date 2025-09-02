import { auth } from "@/auth";
import BorderedDiv from "@/components/BorderedDiv";
import Image from "next/image";
import React from "react";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <div className="min-h-screen h-full flex flex-col pt-4 pr-4 pb-4 gap-4">
      <BorderedDiv className="h-[10%] rounded-lg flex items-center p-4 gap-1">
        <div className="text-3xl">
          <span>Welcome back,</span>{" "}
          <span className="font-bold">{session?.user?.name}</span>
        </div>
        <div className="ml-auto flex gap-2 hover:cursor-pointer hover:">
          <div
            style={{ backgroundImage: `url(${session?.user?.image})` }}
            className={`h-10 w-10 bg-cover bg-center bg-no-repeat bg-red-100 rounded-full`}
          ></div>
          <div className="flex flex-col">
            <div>{session?.user?.name}</div>
            <div className="text-xs text-[#626262]">{session?.user?.email}</div>
          </div>
        </div>
      </BorderedDiv>

      <BorderedDiv className="grow rounded-lg bg-[url(/images/lb-bg.png)] bg-cover bg-top bg-no-repeat p-8 pb-4">
        {children}
      </BorderedDiv>
    </div>
  );
}
