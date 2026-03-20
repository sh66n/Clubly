import mongoose, { Schema, model, models } from "mongoose";
import { IEvent } from "./event.schema";

const eventSchema = new Schema<IEvent>(
  {
    organizingClub: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: true,
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
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    winnerGroup: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    image: {
      type: String,
      required: false,
    },
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
  },
  { timestamps: true },
);

// Indexes
eventSchema.index({ organizingClub: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ superEvent: 1 });

export const Event = models?.Event || model<IEvent>("Event", eventSchema);
