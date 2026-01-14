import { Schema, model, models } from "mongoose";

const groupSchema = new Schema(
  {
    name: { type: String },
    members: [
      {
        // Change from Types.ObjectId to Schema.Types.ObjectId
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    leader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },

    isPublic: { type: Boolean, default: false },
    joinCode: { type: String },
    maxSize: { type: Number },
  },
  { timestamps: true }
);

// Use the safety check we discussed earlier
export const Group = models?.Group || model("Group", groupSchema);
