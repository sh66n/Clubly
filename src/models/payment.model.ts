import mongoose, { Schema, model, models } from "mongoose";

export interface IPayment {
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  groupId?: mongoose.Types.ObjectId;
  amount: number; // in paise
  currency: string;
  status: "created" | "paid" | "failed";
  customQuestionAnswers?: {
    questionId: string;
    answer: string | string[];
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      required: true,
    },
    customQuestionAnswers: [
      {
        questionId: {
          type: String,
          required: true,
        },
        answer: {
          type: Schema.Types.Mixed,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

// Compound index: one paid payment per user per event
paymentSchema.index({ userId: 1, eventId: 1, status: 1 });

export const Payment =
  models?.Payment || model<IPayment>("Payment", paymentSchema);
