import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const host = req.headers.get("host") || "";
  const isProd =
    host.includes("clubly.tech") || process.env.NODE_ENV === "production";

  // Redirect to root landing page
  const targetUrl = host.includes("clubly.tech")
    ? "https://clubly.tech/"
    : new URL("/", req.url).toString();

  const response = NextResponse.redirect(targetUrl, 302);

  // Set Cache-Control to prevent any caching of the logout response
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );

  const cookieNames = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "__Secure-authjs.callback-url",
    "authjs.callback-url",
    "__Host-authjs.csrf-token",
    "authjs.csrf-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "__Secure-authjs.session-token.0",
    "__Secure-authjs.session-token.1",
    "__Secure-authjs.session-token.2",
    "__Secure-authjs.session-token.3",
    "authjs.session-token.0",
    "authjs.session-token.1",
  ];

  const domains = [
    undefined, // host-only cookie
    ".clubly.tech",
    "clubly.tech",
    "www.clubly.tech",
    "pvppcoe.clubly.tech",
  ];

  for (const name of cookieNames) {
    for (const domain of domains) {
      try {
        response.cookies.set({
          name,
          value: "",
          path: "/",
          domain: domain,
          maxAge: 0,
          expires: new Date(0),
          httpOnly: true,
          secure: isProd,
          sameSite: "lax",
        });
      } catch {}
    }
  }

  return response;
}
