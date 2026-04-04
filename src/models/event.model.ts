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
    certificateTemplate: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
      uploadedAt: {
        type: Date,
      },
      layout: {
        tokens: [
          {
            id: {
              type: String,
            },
            variable: {
              type: String,
              enum: ["$name", "$year", "$rank"],
            },
            x: {
              type: Number,
              default: 0.5,
            },
            y: {
              type: Number,
              default: 0.5,
            },
            fontSize: {
              type: Number,
              default: 44,
            },
            colorHex: {
              type: String,
              default: "#111111",
            },
            fontFamily: {
              type: String,
              enum: ["helvetica", "times", "courier"],
              default: "helvetica",
            },
            bold: {
              type: Boolean,
              default: true,
            },
            italic: {
              type: Boolean,
              default: false,
            },
            align: {
              type: String,
              enum: ["left", "center", "right"],
              default: "center",
            },
          },
        ],
      },
      nameConfig: {
        preset: {
          type: String,
          enum: ["center", "lower-third", "top-center"],
          default: "center",
        },
        xOffset: {
          type: Number,
          default: 0,
        },
        yOffset: {
          type: Number,
          default: 0,
        },
        fontSize: {
          type: Number,
          default: 48,
        },
        colorHex: {
          type: String,
          default: "#111111",
        },
      },
    },
  },
  { timestamps: true },
);

// Indexes
eventSchema.index({ organizingClub: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ superEvent: 1 });

export const Event = models?.Event || model<IEvent>("Event", eventSchema);
