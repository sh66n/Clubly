// app/api/superevents/route.ts
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { connectToDb } from "@/lib/connectToDb";
import { SuperEvent } from "@/models/superevent.model";

export async function GET(req: Request) {
  await connectToDb();
  const { searchParams } = new URL(req.url);
  const club = searchParams.get("club");

  if (!club) {
    const allSuperEvents = await SuperEvent.find({}).populate("organizingClub");
    return NextResponse.json(allSuperEvents, { status: 200 });
  }

  const superEvents = await SuperEvent.find(
    { organizingClub: club },
    { name: 1 },
  )
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(superEvents);
}

export const POST = async (req: NextRequest) => {
  try {
    await connectToDb();
    const formData = await req.formData();

    const organizingClub = formData.get("organizingClub") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const startDate = formData.get("startDate") as string | null;
    const endDate = formData.get("endDate") as string | null;

    if (!organizingClub || !name) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    /* ---------- Image Upload ---------- */
    const file = formData.get("image") as unknown as File | null;
    let imageUrl: string | undefined;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "image" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    /* ---------- Date sanity check ---------- */
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return NextResponse.json(
        { message: "End date cannot be before start date" },
        { status: 400 },
      );
    }

    /* ---------- Create SuperEvent ---------- */
    const superEvent = await SuperEvent.create({
      organizingClub,
      name,
      description: description || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      image: imageUrl,
    });

    return NextResponse.json(superEvent, { status: 201 });
  } catch (error) {
    console.error("Create SuperEvent Error:", error);
    return NextResponse.json(
      { message: "Failed to create Super Event" },
      { status: 500 },
    );
  }
};
