import LoginButton from "@/components/LoginButton";
import React from "react";

export default async function Login() {
  return (
    <div className="relative min-h-screen h-full flex-grow pt-4 pr-4 pb-4">
      <div className="h-full rounded-lg p-10 pb-4 border border-[#515151] relative flex flex-col">
        <h1 className="text-5xl font-semibold">Get started with Clubly</h1>
        <div className="my-2 text-[#717171]">Login to your account.</div>
        <div className="grow flex justify-center">
          <div className="mt-14">
            <div className="w-64 h-64">
              <img src="/images/login.png" alt="" />
            </div>
            <div>
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
