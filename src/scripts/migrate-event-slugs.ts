import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import { cleanSlug } from "../lib/slugify";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI / MONGO in environment variables.");
  process.exit(1);
}

async function migrateSlugs() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected successfully.");

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Failed to get MongoDB database instance.");
  }

  const eventsCollection = db.collection("events");

  // Find all events without a slug or with an empty slug
  const eventsWithoutSlug = await eventsCollection
    .find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    })
    .toArray();

  console.log(`Found ${eventsWithoutSlug.length} events needing slugs.`);

  let updatedCount = 0;

  for (const event of eventsWithoutSlug) {
    const eventName = event.name || "event";
    const baseSlug = cleanSlug(eventName) || "event";
    let candidate = baseSlug;
    let counter = 1;

    // Check collision in database
    while (true) {
      const existing = await eventsCollection.findOne({
        slug: candidate,
        _id: { $ne: event._id },
      });

      if (!existing) {
        break;
      }

      counter += 1;
      candidate = `${baseSlug}-${counter}`;
    }

    await eventsCollection.updateOne(
      { _id: event._id },
      { $set: { slug: candidate } }
    );

    console.log(`Updated event "${eventName}" (${event._id}) -> slug: "${candidate}"`);
    updatedCount++;
  }

  console.log(`\nMigration complete. Successfully backfilled ${updatedCount} events.`);
  await mongoose.disconnect();
}

migrateSlugs().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
