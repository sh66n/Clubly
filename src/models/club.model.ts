import mongoose, { Schema, model } from "mongoose";
import { IClub } from "./club.schema";

const clubSchema = new Schema<IClub>(
  {
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
  },
  { timestamps: true },
);

export const Club =
  mongoose.models?.Club || mongoose.model<IClub>("Club", clubSchema);
