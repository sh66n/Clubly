import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { connectToDb } from "./lib/connectToDb";
import { User } from "./models/user.model";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks, // Import the session/jwt shell from above

    async signIn({ user }) {
      const email = user.email;
      if (!email) {
        return "/login?error=missing-email";
      }
      const normalizedEmail = email.toLowerCase().trim();
      // 🔒 Enforce college domain
      if (!normalizedEmail.endsWith("@pvppcoe.ac.in")) {
        console.warn("Blocked non-college email:", normalizedEmail);
        return "/login?error=unauthorized-domain";
      }

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
          },
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

    async jwt({ token, user, trigger, session }) {
      // 1. Initial sign in: attach role from user object
      if (user) {
        token.id = user.id;
      }

      // 2. Fetch fresh data from DB (This part only runs on the Server, not Edge)
      if (token.email) {
        try {
          await connectToDb();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.adminClub = dbUser.adminClub?.toString();
            token.points =
              dbUser.points?.reduce(
                (sum: number, e: any) => sum + (e.points || 0),
                0,
              ) || 0;
            token.image = dbUser.image;
          }
        } catch (error) {
          console.error("JWT Callback DB Error:", error);
        }
      }
      return token;
    },
  },
});
