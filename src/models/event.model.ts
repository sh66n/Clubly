import mongoose, { Schema, model, models } from "mongoose";
import { IEvent } from "./event.schema";
import { tenantPlugin } from "@/lib/tenantPlugin";

const eventSchema = new Schema<IEvent>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    organizingClub: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    collaboratingClubs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Club",
      },
    ],
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      sparse: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: false,
    },
    eventType: {
      type: String,
      enum: ["team", "individual"],
      default: "individual",
      required: true,
    },
    teamSize: {
      type: Number,
      required: false,
    },
    teamSizeRange: {
      min: Number,
      max: Number,
    },
    prize: {
      type: Number,
      required: false,
    },
    providesCertificate: {
      type: Boolean,
      required: true,
    },
    registrationFee: {
      type: Number,
      required: true,
    },
    contact: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    points: {
      participation: {
        type: Number,
      },
      winner: {
        type: Number,
      },
      second: {
        type: Number,
      },
      third: {
        type: Number,
      },
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    winnerGroup: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    numberOfWinners: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    winners: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        group: { type: Schema.Types.ObjectId, ref: "Group" },
        position: { type: Number, enum: [1, 2, 3] },
      },
    ],
    image: {
      type: String,
      required: false,
    },
    eventPhotos: [
      {
        type: String,
      },
    ],
    maxRegistrations: {
      type: Number,
    },
    superEvent: {
      type: Schema.Types.ObjectId,
      ref: "SuperEvent",
    },
    whatsappGroupLink: {
      type: String,
      required: false,
    },
    isRegistrationOpen: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["draft", "live", "completed"],
      default: "live",
    },
    customQuestions: [
      {
        id: {
          type: String,
          required: true,
        },
        question: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["text", "select", "multiselect"],
          required: true,
        },
        required: {
          type: Boolean,
          default: false,
          required: true,
        },
        options: [
          {
            type: String,
          },
        ],
      },
    ],
    certificate: {
      type: Schema.Types.ObjectId,
      ref: "Certificate",
    },
    certificatesByPosition: {
      participation: { type: Schema.Types.ObjectId, ref: "Certificate" },
      first: { type: Schema.Types.ObjectId, ref: "Certificate" },
      second: { type: Schema.Types.ObjectId, ref: "Certificate" },
      third: { type: Schema.Types.ObjectId, ref: "Certificate" },
    },
    feedbackForm: {
      type: Schema.Types.ObjectId,
      ref: "FeedbackForm",
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    naacSignatures: [
      {
        name: { type: String, required: true },
        position: { type: String, required: true },
        signatureUrl: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true },
);

// Indexes
eventSchema.index({ slug: 1 }, { unique: true, sparse: true });
eventSchema.index({ organizingClub: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ superEvent: 1 });

eventSchema.plugin(tenantPlugin);

export const Event = models?.Event || model<IEvent>("Event", eventSchema);
