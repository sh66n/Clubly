import { Types } from "mongoose";
import { z } from "zod";

export const zEvent = z.object({
  organizingClub: z.string().regex(/^[0-9a-fA-F]{24}$/),
  name: z.string(),
  description: z.string().optional(),
  date: z.date(),
  eventType: z.enum(["team", "individual"]).default("individual"),
  teamSize: z.number().optional(),
  prize: z.number().optional(),
  providesCertificate: z.boolean(),
  registrationFee: z.number().optional(),
  contact: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)), // ObjectId as string
  points: z.object({
    participation: z.number(),
    winner: z.number(),
  }),
  registrations: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)),
  participants: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)),
  winners: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)),
  image: z.optional(z.string()),
});

export interface IEvent {
  organizingClub: Types.ObjectId;
  name: string;
  description?: string;
  date: Date;
  eventType: "team" | "individual";
  teamSize?: number;
  prize?: number;
  providesCertificate: boolean;
  registrationFee?: number;
  contact: Types.ObjectId[]; // references User
  points: {
    participation: number;
    winner: number;
  };
  registrations: Types.ObjectId[];
  participants: Types.ObjectId[];
  winners: Types.ObjectId[];
  image: string;
}
