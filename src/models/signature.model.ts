import mongoose, { Schema, model, models } from "mongoose";
import { ISignature } from "./signature.schema";
import { tenantPlugin } from "@/lib/tenantPlugin";

const signatureSchema = new Schema<ISignature>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
    },
    position: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

signatureSchema.index({ userId: 1, name: 1 });

signatureSchema.plugin(tenantPlugin);

export const Signature =
  models?.Signature || model<ISignature>("Signature", signatureSchema);
