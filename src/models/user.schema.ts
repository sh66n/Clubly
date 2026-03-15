import { Types } from "mongoose";
import { z } from "zod";

export const DepartmentEnum = z.enum([
  "Computer Engineering",
  "Artificial Intelligence",
  "Electronics and Computer Science",
  "Information Technology",
  "Mechatronics",
]);

export const YearEnum = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const zUser = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),

  name: z.string(),

  email: z.string().email(),

  role: z.enum(["user", "club-admin"]),

  image: z.string().url(),

  points: z
    .array(
      z.object({
        clubId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        points: z.number().nonnegative().default(0),
      }),
    )
    .default([]),

  adminClub: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),

  phoneNumber: z.string().optional(),

  college: z.string().optional(),

  department: DepartmentEnum.optional(),

  year: YearEnum.optional(),

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
  college?: string;

  department?:
    | "Computer Engineering"
    | "Artificial Intelligence"
    | "Electronics and Computer Science"
    | "Information Technology"
    | "Mechatronics";

  year?: 1 | 2 | 3 | 4;

  createdAt?: Date;
  updatedAt?: Date;
}
