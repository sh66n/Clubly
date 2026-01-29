import { auth } from "@/auth";
import BorderedDiv from "@/components/BorderedDiv";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <div className="min-h-screen h-full flex flex-col py-2 sm:py-4 gap-2">
      {/* Header Section */}
      <BorderedDiv className="h-auto sm:h-[10%] min-h-[80px] rounded-lg flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-1">
        {/* Welcome Message */}
        <div className="text-lg sm:text-2xl lg:text-3xl">
          <span>Welcome back,</span>{" "}
          <span className="font-bold">{session?.user?.name}</span>
        </div>

        {/* User Profile Section */}
        <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2 hover:cursor-pointer">
          {/* Avatar */}
          <Link href={`/profiles/${session?.user?.id}`} className="flex gap-2">
            <div
              style={{ backgroundImage: `url(${session?.user.image})` }}
              className="h-8 w-8 sm:h-10 sm:w-10 bg-cover bg-center bg-no-repeat bg-red-100 rounded-full flex-shrink-0"
            />
            {/* User Info */}
            <div className="flex flex-col min-w-0">
              <div className="text-sm sm:text-base truncate font-medium">
                {session?.user?.name}
              </div>
              <div className="text-xs text-[#626262] truncate">
                {session?.user?.email}
              </div>
            </div>
          </Link>
        </div>
      </BorderedDiv>

      {/* Main Content Area */}
      <BorderedDiv className="grow rounded-lg bg-[url(/images/lb-bg.png)] bg-cover bg-top bg-no-repeat p-4 sm:p-6 lg:p-8 pb-4">
        {children}
      </BorderedDiv>
    </div>
  );
}
