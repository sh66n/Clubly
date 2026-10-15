import NextAuth from "next-auth";
import { headers } from "next/headers";
import { authConfig } from "./auth.config";
import { connectToDb } from "./lib/connectToDb";
import { User } from "./models/user.model";
import { UserPoints } from "./models/userpoints.model";
import { Organization } from "./models/organization.model";
import { runWithoutTenantFilter } from "./lib/tenantPlugin";

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

      try {
        await connectToDb();

        // Query user bypassing default tenant filter
        const existingUser = await runWithoutTenantFilter(() =>
          User.findOne({ email: user.email })
        );

        if (!existingUser) {
          // Determine tenant from headers if available
          let tenantOrg = null;
          try {
            const headerList = await headers();
            const tenantSlug = headerList.get("x-tenant-slug");
            if (tenantSlug) {
              tenantOrg = await runWithoutTenantFilter(() =>
                Organization.findOne({ slug: tenantSlug })
              );
            }
          } catch (e) {
            console.error("Could not read headers during sign-in:", e);
          }

          // Fallback to PVPPCOE default tenant if no subdomain
          if (!tenantOrg) {
            tenantOrg = await runWithoutTenantFilter(() =>
              Organization.findOne({ slug: "pvppcoe" })
            );
          }

          if (tenantOrg) {
            // Check allowed domains
            const emailDomain = normalizedEmail.split("@")[1];
            const isAllowed = tenantOrg.allowedEmailDomains?.some((d: string) =>
              emailDomain === d.toLowerCase().trim() || emailDomain.endsWith("." + d.toLowerCase().trim())
            );

            if (!isAllowed) {
              console.warn(`Blocked email ${normalizedEmail} for tenant ${tenantOrg.slug}`);
              return "/login?error=unauthorized-domain";
            }
          } else {
            // If still no organization exists (before migration), maintain safety
            if (!normalizedEmail.endsWith("@pvppcoe.ac.in")) {
              console.warn("Blocked non-college email signup:", normalizedEmail);
              return "/login?error=unauthorized-domain";
            }
          }

          // uploads google pfp to cloudinary
          let imageUrl = user.image;
          try {
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
            if (data?.success && data?.url) {
              imageUrl = data.url;
            }
          } catch (uploadError) {
            console.error("Failed to upload avatar to cloudinary:", uploadError);
          }

          await runWithoutTenantFilter(() =>
            User.create({
              name: user.name,
              email: user.email,
              image: imageUrl,
              role: "user",
              tenantId: tenantOrg?._id,
              college: tenantOrg?.name || "PVPPCOE",
            })
          );
        }
      } catch (error) {
        console.error("Sign-in DB sync failed, allowing login anyway:", error);
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // 1. Initial sign in: attach role from user object
      if (user) {
        token.id = user.id;
      }

      // Refresh from DB on sign in and explicit session update only
      if (token.email && (user || trigger === "update")) {
        try {
          await connectToDb();
          const dbUser = await runWithoutTenantFilter(() =>
            User.findOne({ email: token.email }).populate("tenantId")
          );
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.name = dbUser.name.toString();
            token.role = dbUser.role;
            token.tenantId = dbUser.tenantId?._id?.toString() || dbUser.tenantId?.toString();
            token.tenantSlug = (dbUser.tenantId as any)?.slug;
            token.adminClub = dbUser.adminClub?.toString();
            token.image = dbUser.image;
            token.phoneNumber = dbUser.phoneNumber;
            token.department = dbUser.department;
            token.year = dbUser.year;

            // Fetch total points from UserPoints collection
            const userPoints = await runWithoutTenantFilter(() =>
              UserPoints.find({ userId: dbUser._id })
            );
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
        session.user.tenantId = token.tenantId as string;
        session.user.tenantSlug = token.tenantSlug as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.points = token.points as number;
        session.user.image = token.image as string;
        session.user.phoneNumber = token.phoneNumber as string;
        session.user.department = token.department as string;
        session.user.year = token.year as any;

        // Expose adminClub in session
        if (token.adminClub) {
          session.user.adminClub = token.adminClub as string;
        }
      }

      return session;
    },
  },
});
