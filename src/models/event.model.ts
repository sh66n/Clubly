import mongoose, { Schema, model } from "mongoose";
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
      required: false,
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
    registrations: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    winners: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    image: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const Event =
  mongoose.models.Event || model<IEvent>("Event", eventSchema);
