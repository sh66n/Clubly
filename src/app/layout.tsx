import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Silkscreen } from "next/font/google";
import { auth } from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  weight: "400",
  variable: "--font-silkscreen",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clubly",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${silkscreen.variable} antialiased flex`}
      >
        <div className="relative h-screen w-1/5 p-4 bg-black">
          <Sidebar points={session?.user.points} />
        </div>
        <div className="grow">
          <div className="relative min-h-screen h-full flex-grow pt-4 pr-4 pb-4">
            <div className="h-full rounded-lg p-10 pb-4 border border-[#515151] relative bg-[url(/images/lb-bg.png)] bg-cover bg-top bg-no-repeat">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
