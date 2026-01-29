import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      authorization: {
        params: {
          hd: "pvppcoe.ac.in",
          prompt: "select_account",
        },
      },
    }),
  ],
};
