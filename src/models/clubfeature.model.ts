import mongoose, { Schema, model, models } from "mongoose";

export interface IClubFeature {
  _id: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  featureSlug: string; // e.g. "streak-card", "custom-leaderboard", "sponsor-wall"
  enabled: boolean;
  config: Record<string, any>; // Flexible JSON config per feature
  createdAt: Date;
  updatedAt: Date;
}

const clubFeatureSchema = new Schema<IClubFeature>(
  {
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    featureSlug: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

// One feature per club
clubFeatureSchema.index({ clubId: 1, featureSlug: 1 }, { unique: true });

export const ClubFeature =
  models?.ClubFeature || model<IClubFeature>("ClubFeature", clubFeatureSchema);
