import mongoose, { Schema, Document, Types } from "mongoose";
import { tenantPlugin } from "@/lib/tenantPlugin";

export interface IAuditLog extends Document {
  tenantId: Types.ObjectId;
  action:
    | "ASSIGN_CLUB_ADMIN"
    | "REVOKE_CLUB_ADMIN"
    | "ASSIGN_FACULTY"
    | "REVOKE_FACULTY"
    | "CREATE_CLUB"
    | "UPDATE_CLUB"
    | "SYSTEM_NOTICE";
  performedBy: Types.ObjectId;
  targetUser?: Types.ObjectId;
  targetClub?: Types.ObjectId;
  details: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "ASSIGN_CLUB_ADMIN",
        "REVOKE_CLUB_ADMIN",
        "ASSIGN_FACULTY",
        "REVOKE_FACULTY",
        "CREATE_CLUB",
        "UPDATE_CLUB",
        "SYSTEM_NOTICE",
      ],
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    targetClub: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
    details: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying & MongoDB Atlas Free Tier safety
// Compound index for super-admin dashboard queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetClub: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// TTL index to automatically prune logs older than 90 days (keeps storage safely minimal on M0 free tier)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

auditLogSchema.plugin(tenantPlugin);

export const AuditLog =
  (mongoose.models?.AuditLog as mongoose.Model<IAuditLog>) ||
  mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
