import mongoose, { Schema, Types } from "mongoose";
import { tenantPlugin } from "@/lib/tenantPlugin";

export interface IFeedbackQuestion {
  id: string;
  text: string;
  required: boolean;
}

export interface IFeedbackForm {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  club: Types.ObjectId;
  name: string;
  questions: IFeedbackQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackQuestionSchema = new Schema<IFeedbackQuestion>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    required: { type: Boolean, default: true },
  },
  { _id: false },
);

const FeedbackFormSchema = new Schema<IFeedbackForm>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    club: { type: Schema.Types.ObjectId, ref: "Club", required: true },
    name: { type: String, required: true },
    questions: [FeedbackQuestionSchema],
  },
  {
    timestamps: true,
  },
);

FeedbackFormSchema.index({ club: 1 });

FeedbackFormSchema.plugin(tenantPlugin);

export const FeedbackForm =
  mongoose.models.FeedbackForm ||
  mongoose.model<IFeedbackForm>("FeedbackForm", FeedbackFormSchema);
