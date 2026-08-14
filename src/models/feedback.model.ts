import mongoose, { Schema, model, models } from "mongoose";

export interface IFeedbackAnswer {
  questionId: string;
  rating: number;
}

export interface IFeedback {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  feedbackFormId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  answers?: IFeedbackAnswer[];
  rating?: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackAnswerSchema = new Schema<IFeedbackAnswer>(
  {
    questionId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false },
);

const FeedbackSchema = new Schema<IFeedback>(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    feedbackFormId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedbackForm",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: {
      type: [FeedbackAnswerSchema],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

// Indexes
FeedbackSchema.index({ eventId: 1 });
FeedbackSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const Feedback =
  models?.Feedback || model<IFeedback>("Feedback", FeedbackSchema);
