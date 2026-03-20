/**
 * Database Migration Script: Normalize Clubly Database
 *
 * This script migrates data from embedded arrays to normalized collections:
 * - Event.registrations[] / Event.groupRegistrations[] -> Registration collection
 * - Event.participants[] / Event.participantGroups[] -> Registration.status
 * - User.points[] -> UserPoints collection
 * - Club.coreMembers[] / Club.volunteers[] -> ClubMember collection
 *
 * Run with: npx tsx scripts/migrate-to-normalized.ts
 *
 * IMPORTANT: Backup your database before running!
 * mongodump --uri="$MONGO" --out=./backup-$(date +%Y%m%d)
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

// Import models
import { Event } from "../src/models/event.model";
import { User } from "../src/models/user.model";
import { Club } from "../src/models/club.model";
import { Registration } from "../src/models/registration.model";
import { UserPoints } from "../src/models/userpoints.model";
import { ClubMember } from "../src/models/clubmember.model";

async function migrate() {
  const mongoUri = process.env.MONGO;
  if (!mongoUri) {
    console.error("ERROR: MONGO environment variable not set");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB\n");

    // Get native MongoDB collections to bypass Mongoose schema filtering
    const db = mongoose.connection.db!;
    const eventsCollection = db.collection("events");
    const usersCollection = db.collection("users");
    const clubsCollection = db.collection("clubs");

    // ========== 1. MIGRATE REGISTRATIONS ==========
    console.log("=".repeat(50));
    console.log("1. MIGRATING REGISTRATIONS");
    console.log("=".repeat(50));

    // Drop old indexes and clear collection for fresh start
    try {
      await db.collection("registrations").dropIndexes();
      console.log("  Dropped old indexes on registrations collection");
    } catch (e) {
      // Collection might not exist yet
    }

    // Clear existing registrations first (fresh start)
    const existingRegs = await Registration.countDocuments();
    if (existingRegs > 0) {
      console.log(`  Clearing ${existingRegs} existing registrations...`);
      await Registration.deleteMany({});
    }

    // Use native driver to get raw documents with old fields
    const events = await eventsCollection.find({}).toArray();
    console.log(`Found ${events.length} events to process`);

    let regCount = 0;
    let eventIndex = 0;

    for (const event of events) {
      eventIndex++;
      const bulkOps: mongoose.AnyBulkWriteOperation<any>[] = [];

      if (event.eventType === "team") {
        // Team events: one Registration per group
        const groupRegistrations = event.groupRegistrations || [];
        const participantGroups = event.participantGroups || [];

        // Skip if no group registrations
        if (groupRegistrations.length === 0) continue;

        for (const groupId of groupRegistrations) {
          if (!groupId) continue; // Skip null/undefined groupIds
          const isAttended = participantGroups.some(
            (g: any) => g && g.toString() === groupId.toString()
          );
          bulkOps.push({
            updateOne: {
              filter: { eventId: event._id, groupId },
              update: {
                $setOnInsert: { registeredAt: event.createdAt || new Date() },
                $set: { status: isAttended ? "attended" : "registered" },
              },
              upsert: true,
            },
          });
        }
      } else {
        // Individual events: one Registration per user
        const registrations = event.registrations || [];
        const participants = event.participants || [];

        // Skip if no registrations
        if (registrations.length === 0) continue;

        for (const userId of registrations) {
          if (!userId) continue; // Skip null/undefined userIds
          const isAttended = participants.some(
            (p: any) => p && p.toString() === userId.toString()
          );
          bulkOps.push({
            updateOne: {
              filter: { eventId: event._id, userId },
              update: {
                $setOnInsert: { registeredAt: event.createdAt || new Date() },
                $set: { status: isAttended ? "attended" : "registered" },
              },
              upsert: true,
            },
          });
        }
      }

      if (bulkOps.length) {
        await Registration.bulkWrite(bulkOps);
        regCount += bulkOps.length;
      }

      // Progress indicator
      if (eventIndex % 10 === 0 || eventIndex === events.length) {
        console.log(`  Processed ${eventIndex}/${events.length} events...`);
      }
    }
    console.log(`\n  Total registrations migrated: ${regCount}`);

    // ========== 2. MIGRATE USER POINTS ==========
    console.log("\n" + "=".repeat(50));
    console.log("2. MIGRATING USER POINTS");
    console.log("=".repeat(50));

    // Clear existing user points first
    const existingPoints = await UserPoints.countDocuments();
    if (existingPoints > 0) {
      console.log(`  Clearing ${existingPoints} existing user points...`);
      await UserPoints.deleteMany({});
    }

    // Use native driver to get users with points array
    const users = await usersCollection.find({ "points.0": { $exists: true } }).toArray();
    console.log(`Found ${users.length} users with points`);

    const pointsOps: mongoose.AnyBulkWriteOperation<any>[] = [];

    for (const user of users) {
      const points = user.points || [];
      for (const p of points) {
        if (p.clubId) {
          pointsOps.push({
            updateOne: {
              filter: { userId: user._id, clubId: p.clubId },
              update: { $setOnInsert: { points: p.points || 0 } },
              upsert: true,
            },
          });
        }
      }
    }

    if (pointsOps.length) {
      await UserPoints.bulkWrite(pointsOps);
    }
    console.log(`  Total user points migrated: ${pointsOps.length}`);

    // ========== 3. MIGRATE CLUB MEMBERS ==========
    console.log("\n" + "=".repeat(50));
    console.log("3. MIGRATING CLUB MEMBERS");
    console.log("=".repeat(50));

    // Clear existing club members first
    const existingMembers = await ClubMember.countDocuments();
    if (existingMembers > 0) {
      console.log(`  Clearing ${existingMembers} existing club members...`);
      await ClubMember.deleteMany({});
    }

    // Use native driver to get clubs with member arrays
    const clubs = await clubsCollection.find({}).toArray();
    console.log(`Found ${clubs.length} clubs`);

    const memberOps: mongoose.AnyBulkWriteOperation<any>[] = [];

    for (const club of clubs) {
      const coreMembers = club.coreMembers || [];
      const volunteers = club.volunteers || [];

      for (const userId of coreMembers) {
        memberOps.push({
          updateOne: {
            filter: { userId, clubId: club._id },
            update: { $setOnInsert: { role: "core" } },
            upsert: true,
          },
        });
      }
      for (const userId of volunteers) {
        memberOps.push({
          updateOne: {
            filter: { userId, clubId: club._id },
            update: { $setOnInsert: { role: "volunteer" } },
            upsert: true,
          },
        });
      }
    }

    if (memberOps.length) {
      await ClubMember.bulkWrite(memberOps);
    }
    console.log(`  Total club members migrated: ${memberOps.length}`);

    // ========== 4. REMOVE OLD FIELDS ==========
    console.log("\n" + "=".repeat(50));
    console.log("4. REMOVING OLD FIELDS FROM DOCUMENTS");
    console.log("=".repeat(50));

    const eventResult = await Event.updateMany(
      {},
      {
        $unset: {
          registrations: "",
          participants: "",
          groupRegistrations: "",
          participantGroups: "",
        },
      }
    );
    console.log(`  Events updated: ${eventResult.modifiedCount}`);

    const userResult = await User.updateMany({}, { $unset: { points: "" } });
    console.log(`  Users updated: ${userResult.modifiedCount}`);

    const clubResult = await Club.updateMany(
      {},
      { $unset: { events: "", coreMembers: "", volunteers: "" } }
    );
    console.log(`  Clubs updated: ${clubResult.modifiedCount}`);

    // ========== 5. ENSURE INDEXES ==========
    console.log("\n" + "=".repeat(50));
    console.log("5. ENSURING INDEXES");
    console.log("=".repeat(50));

    await Registration.ensureIndexes();
    console.log("  Registration indexes created");

    await UserPoints.ensureIndexes();
    console.log("  UserPoints indexes created");

    await ClubMember.ensureIndexes();
    console.log("  ClubMember indexes created");

    // Add indexes to existing models
    try {
      await User.collection.createIndex({ email: 1 }, { unique: true });
      console.log("  User.email unique index created");
    } catch (e: any) {
      if (e.code === 11000) {
        console.log("  User.email index already exists or has duplicates");
      } else {
        throw e;
      }
    }

    await Event.collection.createIndex({ organizingClub: 1 });
    console.log("  Event.organizingClub index created");

    await Event.collection.createIndex({ date: 1 });
    console.log("  Event.date index created");

    // ========== COMPLETE ==========
    console.log("\n" + "=".repeat(50));
    console.log("MIGRATION COMPLETE!");
    console.log("=".repeat(50));

    // Print summary
    console.log("\nSummary:");
    console.log(`  - Registrations created: ${regCount}`);
    console.log(`  - User points migrated: ${pointsOps.length}`);
    console.log(`  - Club members migrated: ${memberOps.length}`);

    console.log("\nVerification queries:");
    const regTotal = await Registration.countDocuments();
    const pointsTotal = await UserPoints.countDocuments();
    const membersTotal = await ClubMember.countDocuments();
    console.log(`  - Registration documents: ${regTotal}`);
    console.log(`  - UserPoints documents: ${pointsTotal}`);
    console.log(`  - ClubMember documents: ${membersTotal}`);

  } catch (error) {
    console.error("\nMIGRATION FAILED:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run migration
migrate();
