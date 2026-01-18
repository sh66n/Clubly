"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react"; // Install lucide-react or use SVG icons

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#howitworks" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled || isOpen ? "backdrop-blur-md bg-black/50" : "bg-transparent"
      } px-6 md:px-16 py-4`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold">
          <div className="h-8 w-8 bg-[url(/images/logo-without-text.png)] bg-contain bg-no-repeat bg-center" />
          <span>Clubly</span>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="hover:text-gray-300 transition-colors"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-4 items-center">
          <Link href="/login">
            <button className="border border-[#5E5E5E] rounded-full py-1.5 px-5 font-bold hover:bg-white/10 transition-all">
              Login
            </button>
          </Link>
          <Link href="/login">
            <button className="bg-white text-black rounded-full py-1.5 px-5 font-bold hover:bg-gray-200 transition-all">
              SignUp
            </button>
          </Link>
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="p-2">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`absolute top-full left-0 w-full bg-black/90 backdrop-blur-lg transition-all duration-300 overflow-hidden md:hidden ${
          isOpen ? "max-h-screen opacity-100 py-8" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col items-center gap-4">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="text-sm"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            </li>
          ))}
          <div className="flex flex-col w-full px-10 gap-4 mt-4">
            <Link href="/login" className="w-full">
              <button className="w-full border border-[#5E5E5E] rounded-full py-3 font-bold text-sm">
                Login
              </button>
            </Link>
            <Link href="/login" className="w-full">
              <button className="w-full bg-white text-black rounded-full py-3 font-bold text-sm">
                SignUp
              </button>
            </Link>
          </div>
        </ul>
      </div>
    </nav>
  );
}
