import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Club, ClubMember, Event } from "@/models";
import cloudinary from "@/lib/cloudinary";
import { runWithoutTenantFilter } from "@/lib/tenantPlugin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDb();
    const session = await auth();

    if (
      !session ||
      session.user.role !== "club-admin" ||
      !session.user.adminClub
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clubId = session.user.adminClub;

    const club = await runWithoutTenantFilter(() =>
      Club.findById(clubId)
        .populate("facultyCoordinator", "name email image department phoneNumber")
        .populate("admins", "name email image department")
        .lean()
    );

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const [eventsCount, coreCount, volunteerCount] = await Promise.all([
      Event.countDocuments({ organizingClub: clubId }),
      ClubMember.countDocuments({ clubId, role: "core" }),
      ClubMember.countDocuments({ clubId, role: "volunteer" }),
    ]);

    return NextResponse.json({
      ...club,
      eventsCount,
      coreCount,
      volunteerCount,
      totalMembers: coreCount + volunteerCount,
      followersCount: club.followers?.length || 0,
      bellFollowersCount: club.bellFollowers?.length || 0,
    });
  } catch (error: any) {
    console.error("GET /api/club-admin/clubs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDb();
    const session = await auth();

    if (
      !session ||
      session.user.role !== "club-admin" ||
      !session.user.adminClub
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clubId = session.user.adminClub;
    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const fullName = formData.get("fullName") as string | null;
    const department = formData.get("department") as string | null;
    const imageFile = formData.get("image") as unknown as File | null;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Club short name is required" }, { status: 400 });
    }
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: "Club full name is required" }, { status: 400 });
    }
    if (!department || !department.trim()) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      name: name.trim(),
      fullName: fullName.trim(),
      department: department.trim(),
    };

    // Upload new logo image if provided
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: "image", folder: "clubs" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      updateData.logo = uploadResult.secure_url;
    }

    const updatedClub = await runWithoutTenantFilter(() =>
      Club.findByIdAndUpdate(clubId, { $set: updateData }, { new: true })
        .populate("facultyCoordinator", "name email image department phoneNumber")
        .populate("admins", "name email image department")
        .lean()
    );

    if (!updatedClub) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const [eventsCount, coreCount, volunteerCount] = await Promise.all([
      Event.countDocuments({ organizingClub: clubId }),
      ClubMember.countDocuments({ clubId, role: "core" }),
      ClubMember.countDocuments({ clubId, role: "volunteer" }),
    ]);

    return NextResponse.json({
      ...updatedClub,
      eventsCount,
      coreCount,
      volunteerCount,
      totalMembers: coreCount + volunteerCount,
      followersCount: updatedClub.followers?.length || 0,
      bellFollowersCount: updatedClub.bellFollowers?.length || 0,
    });
  } catch (error: any) {
    console.error("PATCH /api/club-admin/clubs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
