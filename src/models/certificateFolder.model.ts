import mongoose, { Schema, model, models } from "mongoose";
import { tenantPlugin } from "@/lib/tenantPlugin";

const certificateFolderSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    club: { type: Schema.Types.ObjectId, ref: "Club", required: true },
    name: { type: String, required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event" },
  },
  { timestamps: true }
);

certificateFolderSchema.plugin(tenantPlugin);

export const CertificateFolder = models.CertificateFolder || model("CertificateFolder", certificateFolderSchema);
