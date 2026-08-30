import { Schema, model, models } from "mongoose";
import { IHackathon } from "./hackathon.schema";

const hackathonSchema = new Schema<IHackathon>(
  {
    organizingClub: { type: Schema.Types.ObjectId, ref: "Club", required: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    status: {
      type: String,
      enum: ["draft", "live", "completed"],
      default: "live",
    },
    teamSize: { type: Number, required: true },
    teamSizeRange: {
      min: { type: Number },
      max: { type: Number },
    },
    submissionConfig: {
      templateUrl: { type: String },
      allowedFormats: [{ type: String }],
      maxFileSizeMB: { type: Number, default: 20 },
    },
    prize: { type: Number },
    maxRegistrations: { type: Number },
    isRegistrationOpen: { type: Boolean, default: true },
    contact: [{ type: Schema.Types.ObjectId, ref: "User" }],
    whatsappGroupLink: { type: String },
    customQuestions: [
      {
        id: { type: String, required: true },
        question: { type: String, required: true },
        type: {
          type: String,
          enum: ["text", "select", "multiselect"],
          required: true,
        },
        required: { type: Boolean, required: true },
        options: [{ type: String }],
      },
    ],
    providesCertificate: { type: Boolean, default: false },
    certificate: { type: Schema.Types.ObjectId, ref: "Certificate" },
    numberOfWinners: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    winners: [
      {
        team: { type: Schema.Types.ObjectId, ref: "HackathonTeam" },
        position: { type: Number, enum: [1, 2, 3] },
      },
    ],
    points: {
      participation: { type: Number, default: 10 },
      winner: { type: Number, default: 50 },
      second: { type: Number, default: 40 },
      third: { type: Number, default: 30 },
    },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

hackathonSchema.index({ organizingClub: 1 });
hackathonSchema.index({ status: 1 });

export const Hackathon = models?.Hackathon || model<IHackathon>("Hackathon", hackathonSchema);
