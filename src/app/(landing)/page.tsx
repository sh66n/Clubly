import Diversity from "@/components/Landing/Diversity";
import Features from "@/components/Landing/Features";
import Footer from "@/components/Landing/Footer";
import Hero from "@/components/Landing/Hero";
import HowItWorks from "@/components/Landing/HowItWorks";
import Navbar from "@/components/Landing/Navbar";
import React from "react";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
      <Diversity />
      <HowItWorks />
      <Footer />
    </div>
  );
}
