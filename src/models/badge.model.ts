import mongoose, { Schema, Document } from "mongoose";
import { tenantPlugin } from "@/lib/tenantPlugin";

export interface IBadge extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  type: "participation" | "winner" | "winner_1" | "winner_2" | "winner_3";
  createdAt: Date;
  updatedAt: Date;
}

const badgeSchema = new Schema<IBadge>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    type: {
      type: String,
      enum: ["participation", "winner", "winner_1", "winner_2", "winner_3"],
      default: "participation",
    },
  },
  { timestamps: true }
);

badgeSchema.plugin(tenantPlugin);

export const Badge = mongoose.models?.Badge || mongoose.model<IBadge>("Badge", badgeSchema);
