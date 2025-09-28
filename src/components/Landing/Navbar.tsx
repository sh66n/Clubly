"use client"; // if using Next.js App Router

import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`z-100 fixed flex w-full px-16 py-6 justify-between items-center transition-all duration-300 ${
        scrolled ? "backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="text-3xl mr-auto">
        <div className="font-bold flex items-center gap-2">
          <div className="h-8 w-8 bg-[url(/images/logo-without-text.png)] bg-contain bg-no-repeat bg-center "></div>
          Clubly
        </div>
      </div>
      <div>
        <ul className="flex gap-8">
          <li>
            <a href="#home" className="cursor-pointer">
              Home
            </a>
          </li>
          <li>
            <a href="#features" className="cursor-pointer">
              Features
            </a>
          </li>
          <li>
            <a href="#howitworks" className="cursor-pointer">
              How It Works
            </a>
          </li>
          <li>Contact</li>
        </ul>
      </div>
      <div className="flex gap-2 ml-auto">
        <Link href={"/login"}>
          <button className="border border-[#5E5E5E] rounded-full py-1 px-4 font-bold cursor-pointer">
            Login
          </button>
        </Link>
        <Link href={"/login"}>
          <button className="bg-white text-black rounded-full py-1 px-4 font-bold cursor-pointer">
            SignUp
          </button>
        </Link>
      </div>
    </div>
  );
}
