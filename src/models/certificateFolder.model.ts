import mongoose, { Schema, model, models } from "mongoose";

const certificateFolderSchema = new Schema(
  {
    club: { type: Schema.Types.ObjectId, ref: "Club", required: true },
    name: { type: String, required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event" },
  },
  { timestamps: true }
);

export const CertificateFolder = models.CertificateFolder || model("CertificateFolder", certificateFolderSchema);
