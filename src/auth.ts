import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { connectToDb } from "./lib/connectToDb";
import { User } from "./models/user.model";
import { UserPoints } from "./models/userpoints.model";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks, // Import the session/jwt shell from above

    async signIn({ user }) {
      const email = user.email;
      if (!email) {
        return "/login?error=missing-email";
      }
      // const normalizedEmail = email.toLowerCase().trim();
      // // 🔒 Enforce college domain
      // if (!normalizedEmail.endsWith("@pvppcoe.ac.in")) {
      //   console.warn("Blocked non-college email:", normalizedEmail);
      //   return "/login?error=unauthorized-domain";
      // }

      await connectToDb();

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        //uploads google pfp to cloudinary
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload-avatar`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": process.env.AUTH_SECRET || "",
            },
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
            token.name = dbUser.name.toString();
            token.role = dbUser.role;
            token.adminClub = dbUser.adminClub?.toString();
            token.image = dbUser.image;

            // Fetch total points from UserPoints collection
            const userPoints = await UserPoints.find({ userId: dbUser._id });
            token.points = userPoints.reduce(
              (sum: number, up: any) => sum + (up.points || 0),
              0,
            );
          }
        } catch (error) {
          console.error("JWT Callback DB Error:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.points = token.points as number;
        session.user.image = token.image as string;

        // Expose adminClub in session

        if (token.adminClub) {
          session.user.adminClub = token.adminClub as string;
        }
      }

      return session;
    },
  },
});
