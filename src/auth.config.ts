import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          hd: "pvppcoe.ac.in",
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    // Middleware reads this to protect routes
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      return isLoggedIn;
    },
    // Transfers data from JWT to the Session object
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
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
