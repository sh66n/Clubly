import mongoose, { Schema, model } from "mongoose";
import { IUser } from "./user.schema";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "club-admin"],
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    points: [
      {
        clubId: { type: Schema.Types.ObjectId, ref: "Club" },
        points: { type: Number, default: 0 },
      },
    ],
    adminClub: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
  },
  { timestamps: true }
);

export const User =
  mongoose.models?.User || mongoose.model<IUser>("User", userSchema);
