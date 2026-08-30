import mongoose, { Schema, model, models, Types } from "mongoose";

export interface ICollaboration {
  _id: Types.ObjectId;
  entityType: "event" | "superevent" | "hackathon";
  entityId: Types.ObjectId;
  initiatorClub: Types.ObjectId;
  targetClub: Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const collaborationSchema = new Schema<ICollaboration>(
  {
    entityType: {
      type: String,
      enum: ["event", "superevent", "hackathon"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "entityTypeModel",
    },
    initiatorClub: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    targetClub: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      required: true,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for fast lookup
collaborationSchema.index({ targetClub: 1, status: 1 });
collaborationSchema.index({ initiatorClub: 1, status: 1 });
collaborationSchema.index({ entityType: 1, entityId: 1, targetClub: 1 }, { unique: true });

export const Collaboration =
  models?.Collaboration ||
  model<ICollaboration>("Collaboration", collaborationSchema);
