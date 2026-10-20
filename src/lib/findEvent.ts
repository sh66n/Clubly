import mongoose from "mongoose";
import { Event } from "@/models/event.model";

/**
 * Checks whether an input string is a 24-character hexadecimal MongoDB ObjectId.
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Builds a query to find an event by ObjectId or by Slug.
 * If input is a valid 24-char hex ObjectId, queries by `_id`.
 * Otherwise, queries by `slug`.
 */
export function getEventLookupQuery(idOrSlug: string): Record<string, any> {
  if (isValidObjectId(idOrSlug)) {
    return { _id: idOrSlug };
  }
  return { slug: idOrSlug };
}
