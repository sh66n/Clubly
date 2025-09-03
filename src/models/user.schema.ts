import { Types } from "mongoose";
import { z } from "zod";

export const zUser = z.object({
  points: z
    .array(
      z.object({
        clubId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"), // store ObjectId as string
        points: z.number().nonnegative().default(0),
      })
    )
    .default([]),
  name: z.string(),
  email: z.string(),
  role: z.enum(["user", "club-admin"]),
  image: z.string(),
});

export interface IUser {
  _id?: string;
  points: {
    clubId: Types.ObjectId;
    points: number;
  }[];
  name: string;
  email: string;
  role: "user" | "club-admin";
  image: string;
}
