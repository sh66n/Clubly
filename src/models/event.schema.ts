import { Types } from "mongoose";
import { z } from "zod";

const zCertificateToken = z.object({
  id: z.string(),
  variable: z.enum(["$name", "$year", "$rank"]),
  x: z.number(),
  y: z.number(),
  fontSize: z.number(),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  fontFamily: z.enum(["helvetica", "times", "courier"]),
  bold: z.boolean(),
  italic: z.boolean(),
  align: z.enum(["left", "center", "right"]),
});

const zCertificateLayout = z.object({
  tokens: z.array(zCertificateToken),
});

const zCertificateNameConfig = z.object({
  preset: z.enum(["center", "lower-third", "top-center"]),
  xOffset: z.number(),
  yOffset: z.number(),
  fontSize: z.number(),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

const zCertificateTemplate = z.object({
  url: z.string().url(),
  publicId: z.string(),
  uploadedAt: z.date(),
  layout: zCertificateLayout.optional(),
  nameConfig: zCertificateNameConfig.optional(),
});

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
  certificateTemplate: zCertificateTemplate.optional(),
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
  certificateTemplate?: {
    url: string;
    publicId: string;
    uploadedAt: Date;
    layout?: {
      tokens: {
        id: string;
        variable: "$name" | "$year" | "$rank";
        x: number;
        y: number;
        fontSize: number;
        colorHex: string;
        fontFamily: "helvetica" | "times" | "courier";
        bold: boolean;
        italic: boolean;
        align: "left" | "center" | "right";
      }[];
    };
    nameConfig?: {
      preset: "center" | "lower-third" | "top-center";
      xOffset: number;
      yOffset: number;
      fontSize: number;
      colorHex: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
