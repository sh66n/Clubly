import mongoose, { Schema, model, models } from "mongoose";

export interface IClubMember {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  role: "core" | "volunteer";
  createdAt: Date;
  updatedAt: Date;
}

const clubMemberSchema = new Schema<IClubMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    role: {
      type: String,
      enum: ["core", "volunteer"],
      required: true,
    },
  },
  { timestamps: true },
);

// Indexes
clubMemberSchema.index({ clubId: 1, role: 1 });
clubMemberSchema.index({ userId: 1 });
clubMemberSchema.index({ userId: 1, clubId: 1 }, { unique: true });

export const ClubMember =
  models?.ClubMember || model<IClubMember>("ClubMember", clubMemberSchema);
