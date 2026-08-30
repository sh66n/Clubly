import { Schema, model, models, Types } from "mongoose";

export interface IHackathonTeam {
  _id: Types.ObjectId;
  hackathon: Types.ObjectId;
  name: string;
  leader: Types.ObjectId;
  members: Types.ObjectId[];
  isPublic: boolean;
  joinCode?: string;
  maxSize: number;
  createdAt: Date;
  updatedAt: Date;
}

const hackathonTeamSchema = new Schema<IHackathonTeam>(
  {
    hackathon: { type: Schema.Types.ObjectId, ref: "Hackathon", required: true },
    name: { type: String, default: "Untitled Team" },
    leader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    isPublic: { type: Boolean, default: false },
    joinCode: { type: String },
    maxSize: { type: Number, required: true },
  },
  { timestamps: true }
);

hackathonTeamSchema.index({ hackathon: 1, members: 1 });
hackathonTeamSchema.index({ hackathon: 1, joinCode: 1 });

export const HackathonTeam = models?.HackathonTeam || model<IHackathonTeam>("HackathonTeam", hackathonTeamSchema);
