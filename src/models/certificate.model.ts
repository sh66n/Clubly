import { Schema, model, models } from "mongoose";
import { ICertificate } from "./certificate.schema";

const certificateSchema = new Schema<ICertificate>(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    folder: {
      type: Schema.Types.ObjectId,
      ref: "CertificateFolder",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: false,
      default: "",
    },
    publicId: {
      type: String,
      required: false,
      default: "",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    layout: {
      tokens: [
        {
          _id: false,
          id: { type: String },
          variable: { type: String, required: true },
          x: { type: Number, default: 0.5 },
          y: { type: Number, default: 0.5 },
          fontSize: { type: Number, default: 44 },
          colorHex: { type: String, default: "#111111" },
          fontFamily: { type: String, default: "helvetica" },
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

if (models && models.Certificate) {
  delete (models as any).Certificate;
}

export const Certificate = model<ICertificate>("Certificate", certificateSchema);
