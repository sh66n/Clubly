import { Schema, model, models, Types } from "mongoose";

const groupSchema = new Schema(
  {
    name: { type: String },
    members: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    leader: { type: Types.ObjectId, ref: "User", required: true }, // group admin
    event: { type: Types.ObjectId, ref: "Event", required: true },

    // 🔹 Visibility & Joining
    isPublic: { type: Boolean, default: false }, // false = private
    joinCode: { type: String }, // only for private groups, randomly generated
    maxSize: { type: Number }, // inherit from event by default

    // For public groups
    // allowRequests: { type: Boolean, default: true }, // if true, anyone can directly join
  },
  { timestamps: true }
);

export const Group = models.Group || model("Group", groupSchema);
