import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Silkscreen } from "next/font/google";
import { Toaster } from "sonner";
import SplashScreen from "@/components/SplashScreen";
import { headers, cookies } from "next/headers";
import { connectToDb } from "@/lib/connectToDb";
import { Organization } from "@/models/organization.model";
import { TenantProvider, TenantContextValue } from "@/context/TenantContext";

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
  metadataBase: new URL("https://clubly.tech"),
  openGraph: {
    title: "Clubly",
    description:
      "Everything your club needs, in one platform. Plan, manage, and grow your club with Clubly.",
    url: "https://clubly.tech",
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
  const headerList = await headers();
  const tenantSlug = headerList.get("x-tenant-slug");
  const isPlatformAdmin = headerList.get("x-is-platform-admin") === "true";
  const isRootDomain = headerList.get("x-is-root") === "true";

  let tenantValue: TenantContextValue = {
    isPlatformAdminPortal: isPlatformAdmin,
    isRootDomain,
  };

  if (tenantSlug) {
    try {
      await connectToDb();
      const org = await Organization.findOne({ slug: tenantSlug });
      if (org) {
        tenantValue = {
          tenantId: org._id.toString(),
          slug: org.slug,
          name: org.name,
          logo: org.logo,
          allowedEmailDomains: org.allowedEmailDomains,
          departments: org.departments,
          isPlatformAdminPortal: false,
          isRootDomain: false,
        };
      }
    } catch (e) {
      console.error("Error loading tenant in RootLayout:", e);
    }
  }

  const cookieStore = await cookies();
  const hasSeenSplash = cookieStore.get("hasSeenSplash")?.value === "true";

  return (
    <html lang="en" className={hasSeenSplash ? "splash-seen" : undefined} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var hasCookie = document.cookie.split('; ').some(function(c) {
                  return c.trim().startsWith('hasSeenSplash=');
                });
                var hasSession = sessionStorage.getItem('hasSeenSplash');
                if (hasCookie || hasSession) {
                  document.documentElement.classList.add('splash-seen');
                }
              } catch(e) {}
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
        <TenantProvider value={tenantValue}>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}
