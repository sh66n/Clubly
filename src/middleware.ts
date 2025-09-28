export { auth } from "@/auth";

import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const role = req.auth?.user?.role;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/events")) {
    const segments = pathname.split("/").filter(Boolean); // split path into ["events", "id", "groups"]

    //for /events/new
    if (segments[1] === "new") {
      //redirect to /login for not logged-in users
      if (!req.auth) return NextResponse.redirect(new URL("/login", req.url));

      //redirect to forbidden page for logged-in users
      if (role !== "club-admin") {
        return NextResponse.redirect(new URL("/forbidden", req.url));
      }
    }
    //no login for /events and /events/:id
    if (segments.length <= 2) return NextResponse.next();

    if (segments[2] === "attendance" || segments[2] === "assign-winner") {
      if (!req.auth) return NextResponse.redirect(new URL("/login", req.url));
      if (role !== "club-admin") {
        return NextResponse.redirect(new URL("/forbidden", req.url));
      }
    } else {
      // Other nested routes under /events/:id → just login required
      if (!req.auth) return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard", "/events/:path*"],
};
