import mongoose, { Schema, model, models } from "mongoose";

export interface IFeedback {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true },
);

// Indexes
feedbackSchema.index({ eventId: 1 });
feedbackSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const Feedback =
  models?.Feedback || model<IFeedback>("Feedback", feedbackSchema);
