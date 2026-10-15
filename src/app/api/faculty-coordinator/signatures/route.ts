import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Signature } from "@/models";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

// GET all signatures in coordinator's library
export async function GET(req: NextRequest) {
  try {
    await connectToDb();
    const session = await auth();

    if (
      !session ||
      (session.user.role !== "faculty-coordinator" && session.user.role !== "club-admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signatures = await Signature.find({
      userId: new Types.ObjectId(session.user.id),
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ signatures });
  } catch (error: any) {
    console.error("GET signatures error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST create/save a signature to library
export async function POST(req: NextRequest) {
  try {
    await connectToDb();
    const session = await auth();

    if (
      !session ||
      (session.user.role !== "faculty-coordinator" && session.user.role !== "club-admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, imageUrl, publicId, position } = body;

    if (!name || !imageUrl) {
      return NextResponse.json(
        { error: "Name and imageUrl are required" },
        { status: 400 }
      );
    }

    const newSignature = await Signature.create({
      userId: new Types.ObjectId(session.user.id),
      name: name.trim(),
      imageUrl,
      publicId,
      position: position?.trim() || undefined,
    });

    return NextResponse.json({
      success: true,
      signature: newSignature,
    });
  } catch (error: any) {
    console.error("POST signature error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE a signature from library
export async function DELETE(req: NextRequest) {
  try {
    await connectToDb();
    const session = await auth();

    if (
      !session ||
      (session.user.role !== "faculty-coordinator" && session.user.role !== "club-admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await Signature.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(session.user.id),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE signature error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
