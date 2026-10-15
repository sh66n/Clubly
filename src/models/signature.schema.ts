import { Types } from "mongoose";
import { z } from "zod";

export const zSignature = z.object({
  _id: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  name: z.string().min(1),
  imageUrl: z.string().url(),
  publicId: z.string().optional(),
  position: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export interface ISignature {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  imageUrl: string;
  publicId?: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
}
