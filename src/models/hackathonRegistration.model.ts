import { Schema, model, models, Types } from "mongoose";
import { tenantPlugin } from "@/lib/tenantPlugin";

export interface IHackathonRegistration {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  hackathon: Types.ObjectId;
  team: Types.ObjectId;
  status: "registered" | "active" | "eliminated" | "winner";
  currentRound: number;
  registeredAt: Date;
  customQuestionAnswers?: { questionId: string; answer: string | string[] }[];
  createdAt: Date;
  updatedAt: Date;
}

const hackathonRegistrationSchema = new Schema<IHackathonRegistration>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    hackathon: { type: Schema.Types.ObjectId, ref: "Hackathon", required: true },
    team: { type: Schema.Types.ObjectId, ref: "HackathonTeam", required: true },
    status: {
      type: String,
      enum: ["registered", "active", "eliminated", "winner"],
      required: true,
      default: "registered",
    },
    currentRound: { type: Number, required: true, default: 1 },
    registeredAt: { type: Date, required: true, default: Date.now },
    customQuestionAnswers: [
      {
        questionId: { type: String },
        answer: { type: Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
);

hackathonRegistrationSchema.index({ hackathon: 1, team: 1 }, { unique: true });

hackathonRegistrationSchema.plugin(tenantPlugin);

export const HackathonRegistration = models?.HackathonRegistration || model<IHackathonRegistration>("HackathonRegistration", hackathonRegistrationSchema);
