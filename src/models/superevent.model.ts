import { Schema, model, models } from "mongoose";

export interface ISuperEvent {
  organizingClub: Schema.Types.ObjectId;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  image?: string;
}

const superEventSchema = new Schema<ISuperEvent>(
  {
    organizingClub: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
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

export const SuperEvent =
  models.SuperEvent || model<ISuperEvent>("SuperEvent", superEventSchema);
