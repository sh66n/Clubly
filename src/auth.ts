import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { connectToDb } from "./lib/connectToDb";
import { User } from "./models/user.model";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  callbacks: {
    async signIn({ user }) {
      await connectToDb();

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          role: "user",
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        await connectToDb();
        const dbUser = await User.findOne({ email: user.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.image = dbUser.image;
          token.points = dbUser.points?.reduce(
            (s, e) => s + (e.points || 0),
            0,
          );

          if (dbUser.adminClub) {
            token.adminClub = dbUser.adminClub.toString();
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.points = token.points as number;
        session.user.image = token.image as string;

        if (token.adminClub) {
          session.user.adminClub = token.adminClub as string;
        }
      }
      return session;
    },
  },
});
