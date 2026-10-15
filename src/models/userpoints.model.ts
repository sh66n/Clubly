import mongoose, { Schema, model, models } from "mongoose";
import { tenantPlugin } from "@/lib/tenantPlugin";

export interface IUserPoints {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

const userPointsSchema = new Schema<IUserPoints>(
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
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

// Indexes
userPointsSchema.index({ tenantId: 1, userId: 1, clubId: 1 }, { unique: true });
userPointsSchema.index({ tenantId: 1, clubId: 1, points: -1 }); // Leaderboard queries

userPointsSchema.plugin(tenantPlugin);

export const UserPoints =
  models?.UserPoints || model<IUserPoints>("UserPoints", userPointsSchema);
