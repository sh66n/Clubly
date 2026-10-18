import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

function redirectToLogin(req: Request, pathname: string) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

function extractSubdomain(hostname: string): string | null {
  // Strip port if present
  const host = hostname.split(":")[0].toLowerCase();

  // Root domains that should show the marketing landing page (no tenant)
  if (
    host === "clubly.tech" ||
    host === "www.clubly.tech"
  ) {
    return null;
  }

  // Handle custom domain subdomains (e.g. pvppcoe.clubly.tech or admin.clubly.tech)
  if (host.endsWith(".clubly.tech")) {
    const parts = host.split(".");
    // e.g. pvppcoe.clubly.tech -> ['pvppcoe', 'clubly', 'tech']
    if (parts.length >= 3) {
      const sub = parts[0];
      if (sub === "www") return null;
      return sub;
    }
    return null;
  }

  // If deployed on Vercel's default domain (e.g. clubly-vppcoe.vercel.app),
  // default to the PVPPCOE tenant so existing deployment works out-of-the-box
  if (host.endsWith(".vercel.app")) {
    return "pvppcoe";
  }

  // Handle standard localhost without subdomain (localhost:3000): default to pvppcoe tenant
  if (host === "localhost" || host === "127.0.0.1") {
    return "pvppcoe";
  }

  // Handle localhost subdomains: pvppcoe.localhost or admin.localhost
  if (host.endsWith(".localhost") || host.includes("127.0.0.1")) {
    const parts = host.split(".");
    if (parts.length > 1 && parts[0] !== "localhost" && parts[0] !== "127") {
      return parts[0];
    }
    return "pvppcoe";
  }

  // Generic fallback for any other 3-part hostname (e.g. sub.domain.com)
  const parts = host.split(".");
  if (parts.length >= 3) {
    const sub = parts[0];
    if (sub !== "www") {
      return sub;
    }
    return null;
  }

  return null;
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;
  const role = user?.role;
  const host = req.headers.get("host") || "";
  const cleanHost = host.split(":")[0].toLowerCase();

  const subdomain = extractSubdomain(cleanHost);

  /* ------------------------------
     Determine Request Context
  ------------------------------ */
  const isPlatformAdminPortal = subdomain === "admin" || subdomain === "platform";
  const isRootDomain = !subdomain || subdomain === "www";
  const tenantSlug = !isPlatformAdminPortal && !isRootDomain ? subdomain : null;

  /* ------------------------------
     Allow Next.js internals & static assets
  ------------------------------ */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/images") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Clone headers to inject tenant metadata into downstream request
  const requestHeaders = new Headers(req.headers);
  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug);
  }
  if (isPlatformAdminPortal) {
    requestHeaders.set("x-is-platform-admin", "true");
  }
  if (isRootDomain) {
    requestHeaders.set("x-is-root", "true");
  }

  /* ------------------------------
     Platform Admin Subdomain Guard
  ------------------------------ */
  if (isPlatformAdminPortal) {
    if (pathname === "/") {
      if (req.auth && role === "platform-admin") {
        return NextResponse.redirect(new URL("/platform-admin", req.url));
      }
      return redirectToLogin(req, pathname);
    }

    // Allow public login to admin portal
    if (pathname === "/login") {
      if (req.auth && role === "platform-admin") {
        return NextResponse.redirect(new URL("/platform-admin", req.url));
      }
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (!req.auth) {
      return redirectToLogin(req, pathname);
    }

    if (role !== "platform-admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  /* ------------------------------
     Root Page & Portal Navigation
  ------------------------------ */
  if (pathname === "/") {
    // Root domain (clubly.tech, www.clubly.tech) ALWAYS shows the marketing landing page
    if (isRootDomain && (cleanHost === "clubly.tech" || cleanHost === "www.clubly.tech")) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Subdomains (e.g. pvppcoe.clubly.tech or pvppcoe.localhost):
    if (req.auth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Subdomains redirect unauthenticated visitors directly to /login
    if (tenantSlug) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  /* ------------------------------
     Root Domain Accessing App Routes
  ------------------------------ */
  if (isRootDomain && (cleanHost === "clubly.tech" || cleanHost === "www.clubly.tech")) {
    if (pathname === "/login") {
      return NextResponse.redirect("https://pvppcoe.clubly.tech/login");
    }
    if (
      pathname === "/dashboard" ||
      pathname.startsWith("/events") ||
      pathname.startsWith("/clubs") ||
      pathname.startsWith("/leaderboard") ||
      pathname.startsWith("/me") ||
      pathname.startsWith("/club-admin") ||
      pathname.startsWith("/faculty-coordinator") ||
      pathname.startsWith("/super-admin")
    ) {
      return NextResponse.redirect(`https://pvppcoe.clubly.tech${pathname}`);
    }
  }

  /* ------------------------------
     Logged-in user visiting /login
  ------------------------------ */
  if (pathname === "/login" && req.auth) {
    const callbackUrl =
      req.nextUrl.searchParams.get("callbackUrl") ?? "/dashboard";
    return NextResponse.redirect(new URL(callbackUrl, req.url));
  }

  /* ------------------------------
     Public routes
  ------------------------------ */
  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/events" ||
    pathname === "/clubs" ||
    /^\/clubs\/[^/]+$/.test(pathname) ||
    pathname === "/leaderboard" ||
    /^\/superevents\/[^/]+$/.test(pathname) ||
    pathname === "/certificates" ||
    /^\/certificates\/[^/]+$/.test(pathname) ||
    /^\/profiles\/[^/]+$/.test(pathname);

  if (isPublic) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  /* ------------------------------
     All other pages require login
  ------------------------------ */
  if (!req.auth) {
    return redirectToLogin(req, pathname);
  }

  /* ------------------------------
     Club-admin only routes
  ------------------------------ */
  if (pathname === "/events/new" && role !== "club-admin") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  if (pathname === "/superevents/new" && role !== "club-admin") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  if (/^\/events\/[^/]+\/edit$/.test(pathname)) {
    if (role !== "club-admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  if (/^\/events\/[^/]+\/(attendance|assign-winner)$/.test(pathname)) {
    if (role !== "club-admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  /* ------------------------------
     Club-admin dashboard routes
  ------------------------------ */
  if (pathname.startsWith("/club-admin")) {
    if (role !== "club-admin" || !user?.adminClub) {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  /* ------------------------------
     Faculty-coordinator dashboard routes
  ------------------------------ */
  if (pathname.startsWith("/faculty-coordinator")) {
    if (role !== "faculty-coordinator" || !user?.adminClub) {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  /* ------------------------------
     Super-admin dashboard routes
  ------------------------------ */
  if (pathname.startsWith("/super-admin")) {
    if (role !== "super-admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  /* ------------------------------
     Platform-admin dashboard routes
  ------------------------------ */
  if (pathname.startsWith("/platform-admin")) {
    if (role !== "platform-admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)"],
};
