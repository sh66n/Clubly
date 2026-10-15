import { Types } from "mongoose";
import { z } from "zod";

export const zClub = z.object({
  fullName: z.string(),
  name: z.string(),
  department: z.string(),
  logo: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  followers: z.array(z.string().or(z.any())).optional(),
  bellFollowers: z.array(z.string().or(z.any())).optional(),
  facultyCoordinator: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  admins: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  lastNaacSignatures: z
    .array(
      z.object({
        name: z.string(),
        position: z.string(),
        signatureUrl: z.string().optional(),
      })
    )
    .optional(),
});

export interface IClub {
  _id: Types.ObjectId;
  fullName: string;
  name: string;
  department: string;
  logo: string;
  createdAt: Date;
  updatedAt: Date;
  followers?: Types.ObjectId[];
  bellFollowers?: Types.ObjectId[];
  facultyCoordinator?: Types.ObjectId;
  admins?: Types.ObjectId[];
  lastNaacSignatures?: {
    name: string;
    position: string;
    signatureUrl?: string;
  }[];
}
