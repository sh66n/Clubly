import Diversity from "@/components/Landing/Diversity";
import Features from "@/components/Landing/Features";
import Footer from "@/components/Landing/Footer";
import Hero from "@/components/Landing/Hero";
import HowItWorks from "@/components/Landing/HowItWorks";
import Navbar from "@/components/Landing/Navbar";
import { auth } from "@/auth";
import React from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const session = await auth();

  const safeSession = session?.user
    ? {
        user: {
          name: session.user.name || null,
          email: session.user.email || null,
          image: session.user.image || null,
          role: session.user.role || null,
          tenantSlug: session.user.tenantSlug || "pvppcoe",
        },
      }
    : null;

  return (
    <div>
      <Navbar session={safeSession} />
      <Hero />
      <Features />
      <Diversity />
      <HowItWorks />
      <Footer />
    </div>
  );
}
