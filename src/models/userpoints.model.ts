import mongoose, { Schema, model, models } from "mongoose";

export interface IUserPoints {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

const userPointsSchema = new Schema<IUserPoints>(
  {
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
    },
  },
  { timestamps: true },
);

// Indexes
userPointsSchema.index({ userId: 1, clubId: 1 }, { unique: true });
userPointsSchema.index({ clubId: 1, points: -1 }); // Leaderboard queries

export const UserPoints =
  models?.UserPoints || model<IUserPoints>("UserPoints", userPointsSchema);
