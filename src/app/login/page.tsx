import LoginButton from "@/components/LoginButton";
import LoginErrorToast from "@/components/LoginErrorToast";
import React from "react";

export default async function Login() {
  return (
    <div className="relative min-h-screen h-full flex-grow flex gap-2">
      <LoginErrorToast />

      <div className="hidden md:flex flex-1 bg-[url('/images/dog.jpg')] bg-cover bg-center"></div>
      <div className="flex-1 h-full rounded-lg p-10 pb-4 relative flex flex-col mt-2">
        <h1 className="text-5xl font-semibold">Get started with Clubly</h1>
        <div className="my-2 text-[#717171]">Login to your account.</div>
        <div className="grow flex justify-center">
          <div className="mt-14">
            <div>
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
