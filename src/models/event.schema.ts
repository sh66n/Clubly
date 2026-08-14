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
    second: z.number().optional(),
    third: z.number().optional(),
  }),
  winner: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  numberOfWinners: z.number().min(1).max(3).default(1).optional(),
  image: z.optional(z.string()),
  maxRegistrations: z.number(),
  isRegistrationOpen: z.boolean().default(true),
  status: z.enum(["draft", "live", "completed"]).default("live"),
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
  certificate: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  certificatesByPosition: z.object({
    participation: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    first: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    second: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    third: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  }).optional(),
  feedbackForm: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  likes: z.number().default(0),
  views: z.number().default(0),
  likedBy: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
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
    second?: number;
    third?: number;
  };
  winner?: Types.ObjectId;
  winnerGroup?: Types.ObjectId;
  numberOfWinners: number;
  winners: {
    user?: Types.ObjectId;
    group?: Types.ObjectId;
    position: number;
  }[];
  image: string;
  maxRegistrations: number;
  superEvent: Types.ObjectId;
  whatsappGroupLink: string;
  isRegistrationOpen: boolean;
  status: "draft" | "live" | "completed";
  customQuestions?: ICustomQuestion[];
  certificate?: Types.ObjectId;
  certificatesByPosition?: {
    participation?: Types.ObjectId;
    first?: Types.ObjectId;
    second?: Types.ObjectId;
    third?: Types.ObjectId;
  };
  feedbackForm?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  views: number;
  likedBy: Types.ObjectId[];
}
