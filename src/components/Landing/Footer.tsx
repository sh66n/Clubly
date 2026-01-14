import React from "react";
import { FaLinkedinIn, FaFacebookF, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-black text-white relative">
      {/* Top section with padding */}
      <div className="px-16 py-10">
        <div className="flex justify-between items-start">
          {/* Links */}
          <div className="flex gap-16">
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#">Product</a>
              </li>
              <li>
                <a href="#">Solutions</a>
              </li>
              <li>
                <a href="#">Company</a>
              </li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#">News</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Get a demo</a>
              </li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy-policy">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms-and-conditions">Terms and Conditions</a>
              </li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/contact-us">Contact Us</a>
              </li>
              <li>
                <a href="/cancellations-and-refunds">
                  Cancellations and Refunds
                </a>
              </li>
            </ul>
          </div>

          {/* Social icons */}
          <div className="flex gap-6 text-lg">
            <a href="#" className="hover:text-gray-400">
              <FaLinkedinIn />
            </a>
            <a href="#" className="hover:text-gray-400">
              <FaXTwitter />
            </a>
            <a href="#" className="hover:text-gray-400">
              <FaFacebookF />
            </a>
          </div>
        </div>
      </div>

      {/* Divider full width, not affected by padding */}
      <div className="border-t border-gray-800 w-full"></div>

      {/* Bottom section with padding */}
      <div className="px-16 py-6 flex justify-end items-center">
        <div className="flex items-center gap-2 text-gray-400">
          <img src="/images/logo-without-text.png" alt="logo" className="h-5" />
          <span className="text-2xl font-bold">Clubly</span>
        </div>
      </div>
    </footer>
  );
}
