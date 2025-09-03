import { connectToDb } from "@/lib/connectToDb";
import { Club } from "@/models/club.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectToDb();
    const allClubs = await Club.find({});
    return NextResponse.json(allClubs, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
