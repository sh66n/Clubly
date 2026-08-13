import mongoose from "mongoose";
import { ClubFeature } from "../models/clubfeature.model";
import { Club } from "../models/club.model";
import { connectToDb } from "../lib/connectToDb";
import dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function seed() {
  process.env.NODE_ENV = "development";
  await connectToDb();
  
  // Find CESA club by name
  const cesa = await Club.findOne({ name: "CESA" });
  if (!cesa) {
    console.error("CESA club not found! Check the club name in your database.");
    process.exit(1);
  }
  
  await ClubFeature.findOneAndUpdate(
    { clubId: cesa._id, featureSlug: "streak-card" },
    {
      enabled: true,
      config: {
        semesterStart: "2026-07-01T00:00:00.000Z",
        semesterEnd: "2026-12-31T23:59:59.999Z",
        cardFrontImage: "/images/streak-card-front.jpg",
        cardBackImage: "/images/streak-card-back.jpg",
        gridColumns: 3,
      },
    },
    { upsert: true },
  );
  
  console.log(`✅ Streak card feature enabled for CESA (${cesa._id})`);
  process.exit(0);
}

seed();
