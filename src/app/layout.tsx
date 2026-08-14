import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Silkscreen } from "next/font/google";
import { Toaster } from "sonner";
import SplashScreen from "@/components/SplashScreen";

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
  title: {
    default: "Clubly",
    template: "%s | Clubly",
  },
  description:
    "Everything your club needs, in one platform. Plan, manage, and grow your club with Clubly.",
  metadataBase: new URL("https://clubly-vppcoe.vercel.app"),
  openGraph: {
    title: "Clubly",
    description:
      "Everything your club needs, in one platform. Plan, manage, and grow your club with Clubly.",
    url: "https://clubly-vppcoe.vercel.app",
    siteName: "Clubly",
    images: [
      {
        url: "/images/logo.svg",
        width: 977,
        height: 834,
        alt: "Clubly Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clubly",
    description:
      "Everything your club needs, in one platform. Plan, manage, and grow your club with Clubly.",
    images: ["/images/logo.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
  verification: {
    google: "XIWiVu5dUmHaYTa9OrZAyrt_PP6MFGvYsG3W-tlH_VY",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (sessionStorage.getItem('hasSeenSplash')) {
                document.documentElement.classList.add('splash-seen');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${jakarta.variable} ${silkscreen.variable} antialiased`}
      >
        <Toaster
          position="bottom-right"
          expand={false}
          toastOptions={{
            style: {
              background: "black",
              color: "white",
            },
          }}
          visibleToasts={8}
        />
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
