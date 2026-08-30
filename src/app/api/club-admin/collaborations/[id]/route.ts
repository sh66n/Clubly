import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Collaboration, Event, SuperEvent, Hackathon } from "@/models";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

// PATCH /api/club-admin/collaborations/[id] - Accept or Reject a collaboration request
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDb();
    const session = await auth();
    const { id } = await params;

    if (
      !session ||
      session.user.role !== "club-admin" ||
      !session.user.adminClub
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClubId = new Types.ObjectId(session.user.adminClub);
    const body = await req.json();
    const { action } = body; // "accept" | "reject"

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Action must be 'accept' or 'reject'" }, { status: 400 });
    }

    const collab = await Collaboration.findById(id);
    if (!collab) {
      return NextResponse.json({ error: "Collaboration request not found" }, { status: 404 });
    }

    // Only target club can respond to pending request
    if (!collab.targetClub.equals(adminClubId)) {
      return NextResponse.json({ error: "You cannot respond to this request" }, { status: 403 });
    }

    if (action === "accept") {
      collab.status = "accepted";
      await collab.save();

      // Add targetClub to collaboratingClubs of the entity
      if (collab.entityType === "event") {
        await Event.findByIdAndUpdate(collab.entityId, {
          $addToSet: { collaboratingClubs: adminClubId },
        });
      } else if (collab.entityType === "superevent") {
        await SuperEvent.findByIdAndUpdate(collab.entityId, {
          $addToSet: { collaboratingClubs: adminClubId },
        });
      } else if (collab.entityType === "hackathon") {
        await Hackathon.findByIdAndUpdate(collab.entityId, {
          $addToSet: { collaboratingClubs: adminClubId },
        });
      }
    } else {
      collab.status = "rejected";
      await collab.save();

      // If previously accepted, pull from collaboratingClubs
      if (collab.entityType === "event") {
        await Event.findByIdAndUpdate(collab.entityId, {
          $pull: { collaboratingClubs: adminClubId },
        });
      } else if (collab.entityType === "superevent") {
        await SuperEvent.findByIdAndUpdate(collab.entityId, {
          $pull: { collaboratingClubs: adminClubId },
        });
      } else if (collab.entityType === "hackathon") {
        await Hackathon.findByIdAndUpdate(collab.entityId, {
          $pull: { collaboratingClubs: adminClubId },
        });
      }
    }

    return NextResponse.json(collab, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to update collaboration" }, { status: 500 });
  }
}

// DELETE /api/club-admin/collaborations/[id] - Cancel/Remove a collaboration
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDb();
    const session = await auth();
    const { id } = await params;

    if (
      !session ||
      session.user.role !== "club-admin" ||
      !session.user.adminClub
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClubId = new Types.ObjectId(session.user.adminClub);
    const collab = await Collaboration.findById(id);
    if (!collab) {
      return NextResponse.json({ error: "Collaboration request not found" }, { status: 404 });
    }

    // Must be either initiator or target club
    if (!collab.initiatorClub.equals(adminClubId) && !collab.targetClub.equals(adminClubId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove target club from collaboratingClubs on the entity
    if (collab.entityType === "event") {
      await Event.findByIdAndUpdate(collab.entityId, {
        $pull: { collaboratingClubs: collab.targetClub },
      });
    } else if (collab.entityType === "superevent") {
      await SuperEvent.findByIdAndUpdate(collab.entityId, {
        $pull: { collaboratingClubs: collab.targetClub },
      });
    } else if (collab.entityType === "hackathon") {
      await Hackathon.findByIdAndUpdate(collab.entityId, {
        $pull: { collaboratingClubs: collab.targetClub },
      });
    }

    await Collaboration.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Collaboration removed" }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to remove collaboration" }, { status: 500 });
  }
}
