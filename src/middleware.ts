export { auth } from "@/auth";

import { NextResponse } from "next/server";
import { auth } from "@/auth";

function redirectToLogin(req: Request, pathname: string) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;
  const role = user?.role;

  /* ------------------------------
     Allow Next.js internals
  ------------------------------ */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
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
    /^\/superevents\/[^/]+$/.test(pathname);

  if (isPublic) {
    return NextResponse.next();
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

  // /events/new
  if (pathname === "/events/new" && role !== "club-admin") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  // /superevents/new
  if (pathname === "/superevents/new" && role !== "club-admin") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  // /events/:id/edit
  if (/^\/events\/[^/]+\/edit$/.test(pathname)) {
    if (role !== "club-admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  // /events/:id/(attendance|assign-winner)
  if (/^\/events\/[^/]+\/(attendance|assign-winner)$/.test(pathname)) {
    if (role !== "club-admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }

    // 🔒 Optional ownership check (recommended)
    // const eventId = pathname.split("/")[2];
    // verify event.organizingClub === user.adminClub
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)"],
};
