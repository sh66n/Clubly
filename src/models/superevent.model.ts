import { Schema, model, models } from "mongoose";
import { tenantPlugin } from "@/lib/tenantPlugin";

export interface ISuperEvent {
  tenantId: Schema.Types.ObjectId;
  organizingClub: Schema.Types.ObjectId;
  collaboratingClubs?: Schema.Types.ObjectId[];
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  image?: string;
}

const superEventSchema = new Schema<ISuperEvent>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    organizingClub: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    collaboratingClubs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Club",
      },
    ],
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

superEventSchema.plugin(tenantPlugin);

export const SuperEvent =
  models.SuperEvent || model<ISuperEvent>("SuperEvent", superEventSchema);
