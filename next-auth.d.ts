import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      points: number;
      image: string;
      adminClub?: string; // optional for normal users
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    points: number;
    image: string;
    adminClub?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    points: number;
    image: string;
    adminClub?: string;
  }
}
