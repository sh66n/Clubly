import { Schema, model, models, Types } from "mongoose";

export interface ISubmission {
  _id: Types.ObjectId;
  hackathon: Types.ObjectId;
  round: Types.ObjectId;
  team: Types.ObjectId;
  submittedBy: Types.ObjectId;
  fileUrl: string;
  filePublicId: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  version: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    hackathon: { type: Schema.Types.ObjectId, ref: "Hackathon", required: true },
    round: { type: Schema.Types.ObjectId, ref: "HackathonRound", required: true },
    team: { type: Schema.Types.ObjectId, ref: "HackathonTeam", required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ["pdf", "pptx"], required: true },
    fileSizeBytes: { type: Number, required: true },
    version: { type: Number, required: true, default: 1 },
    submittedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

submissionSchema.index({ hackathon: 1, round: 1, team: 1 }, { unique: true });

export const Submission = models?.Submission || model<ISubmission>("Submission", submissionSchema);
