import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectToDb } from "./lib/connectToDb";
import { User } from "./models/user.model";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Google({
    //   authorization: {
    //     params: {
    //       // Suggests login only from pvppcoe.ac.in
    //       hd: "pvppcoe.ac.in",
    //       prompt: "select_account",
    //     },
    //   },
    // }),
    Google,
  ],
  callbacks: {
    async signIn({ user }) {
      await connectToDb();

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        //uploads google pfp to cloudinary
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload-avatar`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: user.image,
              publicId: user.email?.split("@")[0],
            }),
          }
        );

        const data = await res.json();

        let imageUrl = user.image;
        if (data.success) {
          imageUrl = data.url;
        }
        await User.create({
          name: user.name,
          email: user.email,
          image: imageUrl, // use Cloudinary instead of Google URL
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
          token.role = dbUser.role.toString();
          token.image = dbUser.image.toString();

          const totalPoints = dbUser.points.reduce(
            (sum, entry) => sum + (entry.points || 0),
            0
          );
          token.points = totalPoints;

          // ✅ Add adminClub if present
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

        // ✅ Expose adminClub in session
        if (token.adminClub) {
          session.user.adminClub = token.adminClub as string;
        }
      }
      return session;
    },
  },
});
