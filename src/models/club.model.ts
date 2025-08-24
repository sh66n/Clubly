import mongoose, { Schema, model } from "mongoose";
import { IClub } from "./club.schema";

const clubSchema = new Schema<IClub>(
  {
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    coreMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    volunteers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    logo: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Club =
  mongoose.models?.Club || mongoose.model<IClub>("Club", clubSchema);
