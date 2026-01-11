import { Types } from "mongoose";
import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const zClub = z.object({
  fullName: z.string(),
  name: z.string(),
  department: z.string(),
  coreMembers: z.array(objectId).default([]),
  volunteers: z.array(objectId).default([]),
  events: z.array(objectId).default([]),
  logo: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export interface IClub {
  _id: Types.ObjectId;
  fullName: string;
  name: string;
  department: string;
  coreMembers: Types.ObjectId[]; // refs User
  volunteers: Types.ObjectId[]; // refs User
  events: Types.ObjectId[]; // refs Event
  logo: string;
  createdAt: Date;
  updatedAt: Date;
}
