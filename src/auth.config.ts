import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    maxAge: 3 * 24 * 60 * 60, // 3 days in seconds
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Controls redirects after sign-in and sign-out
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return url;
      // Allows callback URLs on any *.clubly.tech subdomain or localhost
      try {
        const parsedUrl = new URL(url);
        if (
          parsedUrl.hostname === "localhost" ||
          parsedUrl.hostname.endsWith(".localhost") ||
          parsedUrl.hostname === "clubly.tech" ||
          parsedUrl.hostname.endsWith(".clubly.tech")
        ) {
          return url;
        }
      } catch {}
      return url;
    },
    // Let middleware.ts handle all route protection & redirects
    authorized() {
      return true;
    },
    // Transfers data from JWT to the Session object
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.tenantId = token.tenantId as string;
        session.user.tenantSlug = token.tenantSlug as string;
        session.user.role = token.role as string;
        session.user.adminClub = token.adminClub as string;
        session.user.points = token.points as number;
      }
      return session;
    },
    // Basic JWT structure
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
