import mongoose, { Schema, model, models } from "mongoose";

export interface IRegistration {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  groupId?: mongoose.Types.ObjectId;
  status: "registered" | "attended" | "absent";
  registeredAt: Date;
  attendedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    status: {
      type: String,
      enum: ["registered", "attended", "absent"],
      default: "registered",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    attendedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Indexes
registrationSchema.index({ eventId: 1, status: 1 });
// Partial indexes: only index documents where the field exists and is not null
registrationSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: "objectId" } } },
);
registrationSchema.index(
  { eventId: 1, groupId: 1 },
  { unique: true, partialFilterExpression: { groupId: { $type: "objectId" } } },
);
registrationSchema.index({ userId: 1 });
registrationSchema.index({ groupId: 1 });

export const Registration =
  models?.Registration ||
  model<IRegistration>("Registration", registrationSchema);
