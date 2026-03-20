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
  contact: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)),
  points: z.object({
    participation: z.number(),
    winner: z.number(),
  }),
  winner: z.string().regex(/^[0-9a-fA-F]{24}$/),
  image: z.optional(z.string()),
  maxRegistrations: z.number(),
  isRegistrationOpen: z.boolean().default(true),
  customQuestions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string(),
        type: z.enum(["text", "select", "multiselect"]),
        required: z.boolean(),
        options: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

export interface ICustomQuestion {
  id: string;
  question: string;
  type: "text" | "select" | "multiselect";
  required: boolean;
  options?: string[];
}

export interface IEvent {
  _id: Types.ObjectId;
  organizingClub: Types.ObjectId;
  name: string;
  description?: string;
  date: Date;
  eventType: "team" | "individual";
  teamSize?: number;
  teamSizeRange?: {
    min: number;
    max: number;
  };
  prize?: number;
  providesCertificate: boolean;
  registrationFee: number;
  contact: Types.ObjectId[];
  points: {
    participation: number;
    winner: number;
  };
  winner: Types.ObjectId;
  winnerGroup: Types.ObjectId;
  image: string;
  maxRegistrations: number;
  superEvent: Types.ObjectId;
  whatsappGroupLink: string;
  isRegistrationOpen: boolean;
  customQuestions?: ICustomQuestion[];
  createdAt: Date;
  updatedAt: Date;
}
