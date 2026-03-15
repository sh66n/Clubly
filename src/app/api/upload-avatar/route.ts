import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@/auth";

// Ensure this runs in Node.js runtime, not Edge
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Auth: allow either a logged-in user or an internal server call
    const internalSecret = req.headers.get("x-internal-secret");
    const isInternalCall = internalSecret === process.env.AUTH_SECRET;

    if (!isInternalCall) {
      const session = await auth();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { url, publicId } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const uploadRes = await cloudinary.uploader.upload(url, {
      folder: "clubly/avatars",
      public_id: publicId || undefined, // optional
      overwrite: true,
      resource_type: "image",
    });

    return NextResponse.json({
      success: true,
      url: uploadRes.secure_url,
      public_id: uploadRes.public_id,
    });
  } catch (err: any) {
    console.error("Cloudinary upload failed", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
