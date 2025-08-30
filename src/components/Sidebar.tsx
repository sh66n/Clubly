"use client";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar({ points }) {
  const pathname = usePathname().split("/")[1];
  return (
    <div className="h-full rounded-lg p-4 flex flex-col border border-[#515151] relative">
      <div className="mt-4">
        <Image
          height={160}
          width={160}
          src={"/images/logo.png"}
          alt="logo.png"
        />
      </div>

      <div className="mt-12">
        <div className="heading text-[#626262] mb-2">Menu</div>
        <ul>
          {["dashboard", "events", "clubs", "leaderboard"].map((item) => (
            <li
              key={item}
              className={`mb-1 ${
                pathname.includes(item)
                  ? "text-white font-semibold"
                  : "text-[#9F9F9F]"
              }`}
            >
              <Link href={`/${item}`}>
                <div className="flex gap-4">
                  <Image
                    src={`/icons/${item}.svg`}
                    width={20}
                    height={20}
                    alt="image"
                  ></Image>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 text-[#626262]">
        <div className="heading mb-2">General</div>
        <ul>
          {["Settings", "Help", "Logout"].map((item) => (
            <li key={item} className="text-[#9F9F9F] mb-1">
              <Link href={"/dashboard"}>{item}</Link>
            </li>
          ))}
        </ul>
      </div>
      {points && (
        <div className="mt-auto w-full aspect-square bg-[url('/images/myPoints.png')] bg-cover bg-center bg-no-repeat rounded-md p-4 pt-8 text-3xl">
          <span>My Points</span>
          <div className="text-7xl text-center mt-6 font-semibold">
            {points}
          </div>
        </div>
      )}
    </div>
  );
}
