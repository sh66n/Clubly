import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectToDb } from "./lib/connectToDb";
import { User } from "./models/user.model";

// Google(
//       {
//       authorization: {
//         params: {
//           // Suggests login only from pvppcoe.ac.in
//           hd: "pvppcoe.ac.in",
//           prompt: "select_account",
//         },
//       },
//     }),

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
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

          const totalPoints = dbUser.points.reduce(
            (sum, entry) => sum + (entry.points || 0),
            0
          );

          token.points = totalPoints;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.points = token.points;
      }
      return session;
    },
  },
});
