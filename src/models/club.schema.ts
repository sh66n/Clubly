import { Types } from "mongoose";
import { z } from "zod";

export const zClub = z.object({
  fullName: z.string(),
  name: z.string(),
  department: z.string(),
  logo: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export interface IClub {
  _id: Types.ObjectId;
  fullName: string;
  name: string;
  department: string;
  logo: string;
  createdAt: Date;
  updatedAt: Date;
}
