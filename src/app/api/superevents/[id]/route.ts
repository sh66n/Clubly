// app/api/superevents/[id]/route.ts
import { connectToDb } from "@/lib/connectToDb";
import { SuperEvent } from "@/models/superevent.model";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectToDb();

  const { id } = await params;

  const superEvent = await SuperEvent.findById(id)
    .populate("organizingClub")
    .populate("collaboratingClubs");

  if (!superEvent) {
    return NextResponse.json(
      { message: "SuperEvent not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(superEvent);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDb();
    const session = await auth();
    if (!session || session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const superEvent = await SuperEvent.findById(id);
    if (!superEvent) {
      return NextResponse.json({ error: "SuperEvent not found" }, { status: 404 });
    }

    if (superEvent.organizingClub.toString() !== session.user.adminClub?.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const startDate = formData.get("startDate") as string | null;
    const endDate = formData.get("endDate") as string | null;

    let imageUrl = superEvent.image;
    const file = formData.get("image") as unknown as File | null;
    if (file && file.size > 0) {
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ message: "Image must be less than 10MB" }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return NextResponse.json({ message: "End date cannot be before start date" }, { status: 400 });
    }

    superEvent.name = name || superEvent.name;
    if (description !== null) superEvent.description = description;
    if (startDate !== null) superEvent.startDate = new Date(startDate);
    if (endDate !== null) superEvent.endDate = new Date(endDate);
    if (imageUrl) superEvent.image = imageUrl;

    await superEvent.save();
    return NextResponse.json(superEvent);
  } catch (error) {
    console.error("Update SuperEvent Error:", error);
    return NextResponse.json({ message: "Failed to update Super Event" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDb();
    const session = await auth();
    if (!session || session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const superEvent = await SuperEvent.findById(id);
    if (!superEvent) {
      return NextResponse.json({ error: "SuperEvent not found" }, { status: 404 });
    }

    if (superEvent.organizingClub.toString() !== session.user.adminClub?.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await SuperEvent.findByIdAndDelete(id);
    return NextResponse.json({ message: "Super Event deleted successfully" });
  } catch (error) {
    console.error("Delete SuperEvent Error:", error);
    return NextResponse.json({ message: "Failed to delete Super Event" }, { status: 500 });
  }
}
