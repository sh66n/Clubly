import { Schema, model, models, Types } from "mongoose";
import { tenantPlugin } from "@/lib/tenantPlugin";

export interface IHackathonRound {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  hackathon: Types.ObjectId;
  roundNumber: number;
  name: string;
  description?: string;
  status: "upcoming" | "active" | "evaluating" | "completed";
  registrationFee: number;
  submissionDeadline?: Date;
  resultDate?: Date;
  requiresSubmission: boolean;
  submissionInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const hackathonRoundSchema = new Schema<IHackathonRound>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    hackathon: { type: Schema.Types.ObjectId, ref: "Hackathon", required: true },
    roundNumber: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["upcoming", "active", "evaluating", "completed"],
      required: true,
    },
    registrationFee: { type: Number, required: true, default: 0 },
    submissionDeadline: { type: Date },
    resultDate: { type: Date },
    requiresSubmission: { type: Boolean, required: true, default: false },
    submissionInstructions: { type: String },
  },
  { timestamps: true }
);

hackathonRoundSchema.index({ hackathon: 1, roundNumber: 1 }, { unique: true });

hackathonRoundSchema.plugin(tenantPlugin);

export const HackathonRound = models?.HackathonRound || model<IHackathonRound>("HackathonRound", hackathonRoundSchema);
