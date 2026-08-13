import { Schema, model, models } from "mongoose";
import { ICertificate } from "./certificate.schema";

const certificateSchema = new Schema<ICertificate>(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    layout: {
      tokens: [
        {
          id: { type: String },
          variable: { type: String, enum: ["$name", "$year", "$rank"] },
          x: { type: Number, default: 0.5 },
          y: { type: Number, default: 0.5 },
          fontSize: { type: Number, default: 44 },
          colorHex: { type: String, default: "#111111" },
          fontFamily: { type: String, enum: ["helvetica", "times", "courier"], default: "helvetica" },
          bold: { type: Boolean, default: true },
          italic: { type: Boolean, default: false },
          align: { type: String, enum: ["left", "center", "right"], default: "center" },
        },
      ],
    },
    nameConfig: {
      preset: { type: String, enum: ["center", "lower-third", "top-center"], default: "center" },
      xOffset: { type: Number, default: 0 },
      yOffset: { type: Number, default: 0 },
      fontSize: { type: Number, default: 48 },
      colorHex: { type: String, default: "#111111" },
    },
  },
  { timestamps: true }
);

certificateSchema.index({ club: 1 });

export const Certificate = models?.Certificate || model<ICertificate>("Certificate", certificateSchema);
