export { auth } from "@/auth";

import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth(async (req) => {
  const role = req.auth?.user?.role;
  const user = req.auth?.user;
  const { pathname } = req.nextUrl;

  if (pathname === "/login") {
    if (req.auth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

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

      //check if the club-admin belongs to the club he wants to make changes to
      const eventId = segments[1];
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${eventId}`,
          {
            headers: { cookie: req.headers.get("cookie") ?? "" },
          }
        );

        if (res.ok) {
          const { event } = await res.json();
          const organizingClubId = event.organizingClub._id;

          if (organizingClubId?.toString() !== user?.adminClub?.toString()) {
            return NextResponse.redirect(new URL("/forbidden", req.url));
          }
        } else {
          return NextResponse.redirect(new URL("/forbidden", req.url));
        }
      } catch (err) {
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
  matcher: ["/dashboard", "/events/:path*", "/login"],
};
