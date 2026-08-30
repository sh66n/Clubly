import { Types } from "mongoose";
import { z } from "zod";
import { ICustomQuestion } from "./event.schema";

export const zHackathon = z.object({
  organizingClub: z.string().regex(/^[0-9a-fA-F]{24}$/),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(["draft", "live", "completed"]).default("live"),
  teamSize: z.number(),
  teamSizeRange: z.object({ min: z.number(), max: z.number() }).optional(),
  submissionConfig: z.object({
    templateUrl: z.string().optional(),
    allowedFormats: z.array(z.string()).optional(),
    maxFileSizeMB: z.number().optional(),
  }).optional(),
  prize: z.number().optional(),
  maxRegistrations: z.number().optional(),
  isRegistrationOpen: z.boolean().default(true),
  contact: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)),
  whatsappGroupLink: z.string().optional(),
  customQuestions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    type: z.enum(["text", "select", "multiselect"]),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  })).optional(),
  providesCertificate: z.boolean().optional(),
  numberOfWinners: z.number().min(1).max(3).default(1).optional(),
  points: z.object({
    participation: z.number().optional(),
    winner: z.number().optional(),
    second: z.number().optional(),
    third: z.number().optional(),
  }).optional(),
});

export interface IHackathon {
  _id: Types.ObjectId;
  organizingClub: Types.ObjectId;
  collaboratingClubs?: Types.ObjectId[];
  name: string;
  description?: string;
  image?: string;
  status: "draft" | "live" | "completed";
  teamSize: number;
  teamSizeRange?: { min: number; max: number };
  submissionConfig?: {
    templateUrl?: string;
    allowedFormats?: string[];
    maxFileSizeMB?: number;
  };
  prize?: number;
  maxRegistrations?: number;
  isRegistrationOpen: boolean;
  contact: Types.ObjectId[];
  whatsappGroupLink?: string;
  customQuestions?: ICustomQuestion[];
  providesCertificate?: boolean;
  certificate?: Types.ObjectId;
  numberOfWinners?: number;
  winners?: { team?: Types.ObjectId; position: number }[];
  points?: {
    participation?: number;
    winner?: number;
    second?: number;
    third?: number;
  };
  likes: number;
  views: number;
  likedBy?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
