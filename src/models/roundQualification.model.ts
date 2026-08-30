import { Schema, model, models, Types } from "mongoose";

export interface IRoundQualification {
  _id: Types.ObjectId;
  hackathon: Types.ObjectId;
  round: Types.ObjectId;
  team: Types.ObjectId;
  status: "qualified" | "eliminated" | "waitlisted";
  qualifiedBy: Types.ObjectId;
  remarks?: string;
  paymentStatus: "not_required" | "pending" | "paid";
  qualifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const roundQualificationSchema = new Schema<IRoundQualification>(
  {
    hackathon: { type: Schema.Types.ObjectId, ref: "Hackathon", required: true },
    round: { type: Schema.Types.ObjectId, ref: "HackathonRound", required: true },
    team: { type: Schema.Types.ObjectId, ref: "HackathonTeam", required: true },
    status: {
      type: String,
      enum: ["qualified", "eliminated", "waitlisted"],
      required: true,
    },
    qualifiedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    remarks: { type: String },
    paymentStatus: {
      type: String,
      enum: ["not_required", "pending", "paid"],
      required: true,
      default: "not_required",
    },
    qualifiedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

roundQualificationSchema.index({ hackathon: 1, round: 1, team: 1 }, { unique: true });
roundQualificationSchema.index({ hackathon: 1, team: 1 });

export const RoundQualification = models?.RoundQualification || model<IRoundQualification>("RoundQualification", roundQualificationSchema);
