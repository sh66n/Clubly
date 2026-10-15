import mongoose, { Schema, model } from "mongoose";
import { IClub } from "./club.schema";
import { tenantPlugin } from "@/lib/tenantPlugin";

const clubSchema = new Schema<IClub>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bellFollowers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    facultyCoordinator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastNaacSignatures: [
      {
        name: { type: String, required: true },
        position: { type: String, required: true },
        signatureUrl: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true },
);

clubSchema.plugin(tenantPlugin);

export const Club =
  (mongoose.models?.Club as mongoose.Model<IClub>) ||
  mongoose.model<IClub>("Club", clubSchema);
