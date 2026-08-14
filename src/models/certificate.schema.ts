import { Types } from "mongoose";
import { z } from "zod";

export const zCertificateToken = z.object({
  id: z.string(),
  variable: z.string(),
  x: z.number(),
  y: z.number(),
  fontSize: z.number(),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  fontFamily: z.string(),
  bold: z.boolean(),
  italic: z.boolean(),
  align: z.enum(["left", "center", "right"]),
});

export const zCertificateLayout = z.object({
  tokens: z.array(zCertificateToken),
});

export const zCertificateNameConfig = z.object({
  preset: z.enum(["center", "lower-third", "top-center"]),
  xOffset: z.number(),
  yOffset: z.number(),
  fontSize: z.number(),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const zCertificate = z.object({
  club: z.string().regex(/^[0-9a-fA-F]{24}$/),
  name: z.string(),
  url: z.string().url(),
  publicId: z.string(),
  uploadedAt: z.date(),
  isDraft: z.boolean().optional(),
  layout: zCertificateLayout.optional(),
  nameConfig: zCertificateNameConfig.optional(),
});

export interface ICertificate {
  _id: Types.ObjectId;
  club: Types.ObjectId;
  name: string;
  url: string;
  publicId: string;
  uploadedAt: Date;
  isDraft?: boolean;
  layout?: {
    tokens: {
      id: string;
      variable: string;
      x: number;
      y: number;
      fontSize: number;
      colorHex: string;
      fontFamily: string;
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
  createdAt: Date;
  updatedAt: Date;
}
