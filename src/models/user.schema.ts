import { Types } from "mongoose";
import { z } from "zod";

export const zUser = z.object({
  points: z
    .array(
      z.object({
        clubId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"), // store ObjectId as string
        points: z.number().nonnegative().default(0),
      }),
    )
    .default([]),
  _id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["user", "club-admin"]),
  image: z.string().url(),
  adminClub: z.string().length(24).optional(),
  phoneNumber: z.optional(z.string()),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  role: "user" | "club-admin";
  image: string;
  points?: {
    clubId: Types.ObjectId;
    points: number;
  }[];
  adminClub?: Types.ObjectId;
  phoneNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
