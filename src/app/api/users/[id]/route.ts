import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import cloudinary from "@/lib/cloudinary";

/* ---------------- GET USER ---------------- */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDb();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

/* ---------------- UPDATE USER ---------------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    // 1. Authentication Check
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Authorization Check (Users can only edit themselves unless they are Super Admin)
    // Note: session.user.id or session.user._id depending on your auth config
    const currentUserId = (session.user as any)._id || (session.user as any).id;

    if (currentUserId !== id && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own profile" },
        { status: 403 },
      );
    }

    await connectToDb();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const formData = await req.formData();

    // Extract data
    const name = formData.get("name") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const file = formData.get("avatar") as unknown as File | null; // Key matches frontend input name

    const updateData: Record<string, any> = {};

    // 3. Security: Only allow specific fields to be updated via this route
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    // 4. Cloudinary Image Upload (Same logic as events)
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "avatars", // Organized folder in Cloudinary
              transformation: [{ width: 400, height: 400, crop: "fill" }], // Optional: standard crop
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(buffer);
      });

      updateData.image = uploadResult.secure_url;
    }

    // 5. Database Update
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (err: any) {
    console.error("Update Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update user" },
      { status: 500 },
    );
  }
}
