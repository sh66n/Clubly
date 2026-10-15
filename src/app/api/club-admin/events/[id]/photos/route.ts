import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

// GET photos for this event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await Event.findById(id).select("eventPhotos organizingClub").lean();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Allow both club admin of organizing club and faculty coordinator of this club
    if (event.organizingClub.toString() !== session.user.adminClub.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      eventPhotos: (event as any).eventPhotos || [],
    });
  } catch (error: any) {
    console.error("GET event photos error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST upload photo for this event
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizingClub.toString() !== session.user.adminClub.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("photo") as unknown as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "clubly/event_glimpses", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const photoUrl = uploadResult.secure_url;

    // Append to eventPhotos array
    await Event.findByIdAndUpdate(id, {
      $push: { eventPhotos: photoUrl },
    });

    return NextResponse.json({
      success: true,
      photoUrl,
    });
  } catch (error: any) {
    console.error("POST event photo error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}

// DELETE a photo by URL
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizingClub.toString() !== session.user.adminClub.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { photoUrl } = await req.json();

    if (!photoUrl) {
      return NextResponse.json({ error: "photoUrl is required" }, { status: 400 });
    }

    await Event.findByIdAndUpdate(id, {
      $pull: { eventPhotos: photoUrl },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE event photo error:", error);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
