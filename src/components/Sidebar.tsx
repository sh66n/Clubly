"use client";
import Image from "next/image";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import LoginButton from "./LoginButton";
import {
  Bolt,
  Calendar,
  Goal,
  Info,
  LayoutDashboard,
  LogIn,
  PanelLeft,
  Power,
  Users,
} from "lucide-react";

export default function Sidebar({ points }) {
  const pathname = usePathname().split("/")[1];

  return (
    <div className="hidden h-full rounded-lg p-4 lg:flex flex-col border border-[#515151] relative">
      <div className="mt-4 flex items-center justify-between">
        <Image
          src="/images/logo.png"
          alt="Clubly Logo"
          width={160}
          height={160}
          priority
          placeholder="empty"
          className="object-contain"
        />
        {/* <img src="/images/logo-without-text.png" className="h-6 w-6" alt="" />
        <PanelLeft className="" /> */}
      </div>

      <div className="mt-12">
        <div className="heading text-[#626262] mb-2 text-xl">Menu</div>
        <ul>
          {/* Dashboard */}

          <li
            className={`mb-1 ${
              pathname.includes("dashboard") ? "text-white" : "text-[#9F9F9F]"
            }`}
          >
            <Link href={"/dashboard"}>
              <span className="flex gap-4 items-center hover:text-white hover:cursor-pointer">
                <LayoutDashboard />
                Dashboard
              </span>
            </Link>
          </li>

          {/* Events */}

          <li
            className={`mb-1 ${
              pathname.includes("events") ? "text-white" : "text-[#9F9F9F]"
            }`}
          >
            <Link href={"/events"}>
              <span className="flex gap-4 items-center hover:text-white hover:cursor-pointer">
                <Calendar />
                Events
              </span>
            </Link>
          </li>

          {/* Clubs */}

          <li
            className={`mb-1 ${
              pathname.includes("clubs") ? "text-white" : "text-[#9F9F9F]"
            }`}
          >
            <Link href={"/clubs"}>
              <span className="flex gap-4 items-center hover:text-white hover:cursor-pointer">
                <Users />
                Clubs
              </span>
            </Link>
          </li>

          {/* Leaderboard */}

          <li
            className={`mb-1 ${
              pathname.includes("leaderboard") ? "text-white" : "text-[#9F9F9F]"
            }`}
          >
            <Link href={"/leaderboard"}>
              <span className="flex gap-4 items-center hover:text-white hover:cursor-pointer">
                <Goal />
                Leaderboard
              </span>
            </Link>
          </li>

          {/* {["dashboard", "events", "clubs", "leaderboard"].map((item) => (
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
                  <span className="hover:text-white">
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </span>
                </div>
              </Link>
            </li>
          ))} */}
        </ul>
      </div>

      <div className="mt-4 text-[#626262]">
        <div className="heading mb-2 text-xl">General</div>
        <ul className="">
          <li className="text-[#9F9F9F] mb-1 flex gap-4 items-center hover:text-white hover:cursor-pointer">
            <Bolt />
            Settings
          </li>
          <li className="text-[#9F9F9F] mb-1">
            <span className="flex gap-4 items-center hover:text-white hover:cursor-pointer">
              <Info className="" />
              Help
            </span>
          </li>
          {/* if points is defined, that means a user IS logged in*/}
          {points ? (
            <li className="text-[#9F9F9F] mb-1">
              <span className="flex gap-4 items-center hover:text-white hover:cursor-pointer">
                <Power />
                <LogoutButton />
              </span>
            </li>
          ) : (
            <li className="mb-1">
              <Link
                href={"/login"}
                className="text-[#9F9F9F] hover:text-white flex gap-4 items-center"
              >
                <LogIn className="" />
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
      {points && (
        <div className="mt-auto w-full aspect-square bg-[url('/images/myPoints.png')] bg-cover bg-center bg-no-repeat rounded-md p-4 pt-8 text-sm md:text-xl lg:text-3xl">
          <span>My Points</span>
          <div className="text-sm md:text-3xl lg:text-7xl text-center mt-6 font-semibold">
            {points}
          </div>
        </div>
      )}
    </div>
  );
}
