import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrganization extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  allowedEmailDomains: string[];
  departments: string[];
  contactEmail?: string;
  plan?: "free" | "starter" | "enterprise";
  primaryColor?: string;
  status: "active" | "suspended" | "trial";
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
          },
    logo: {
      type: String,
      default: "",
    },
    allowedEmailDomains: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    departments: [
      {
        type: String,
        trim: true,
      },
    ],
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    plan: {
      type: String,
      enum: ["free", "starter", "enterprise"],
      default: "free",
    },
    primaryColor: {
      type: String,
      default: "#10b981",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "trial"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Organization =
  (mongoose.models?.Organization as mongoose.Model<IOrganization>) ||
  mongoose.model<IOrganization>("Organization", organizationSchema);
