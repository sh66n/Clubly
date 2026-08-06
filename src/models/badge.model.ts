import mongoose, { Schema, Document } from "mongoose";

export interface IBadge extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  type: "participation" | "winner";
  createdAt: Date;
  updatedAt: Date;
}

const badgeSchema = new Schema<IBadge>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    type: {
      type: String,
      enum: ["participation", "winner"],
      default: "participation",
    },
  },
  { timestamps: true }
);

export const Badge = mongoose.models?.Badge || mongoose.model<IBadge>("Badge", badgeSchema);
