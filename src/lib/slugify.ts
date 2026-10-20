import { Event } from "@/models/event.model";

/**
 * Normalizes a raw string into a clean URL-friendly slug.
 * - Lowercases the string
 * - Replaces non-alphanumeric chars with hyphens
 * - Collapses consecutive hyphens
 * - Trims hyphens from ends
 */
export function cleanSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/[\s_]+/g, "-") // replace spaces and underscores with hyphen
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // trim leading & trailing hyphens
}

/**
 * Generates a unique event slug within the system.
 * If the base slug already exists, appends `-2`, `-3`, etc., or matches with excludeId.
 */
export async function generateUniqueEventSlug(
  name: string,
  excludeEventId?: string
): Promise<string> {
  const baseSlug = cleanSlug(name) || "event";
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const query: Record<string, any> = { slug: candidate };
    if (excludeEventId) {
      query._id = { $ne: excludeEventId };
    }

    const existing = await Event.findOne(query).select("_id").lean();
    if (!existing) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}
