import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Collaboration, Event, SuperEvent, Hackathon, Club } from "@/models";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

// GET /api/club-admin/collaborations - List incoming & outgoing collaboration requests
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

    const adminClubId = new Types.ObjectId(session.user.adminClub);

    // 1. Incoming requests to my club
    const incoming = await Collaboration.find({ targetClub: adminClubId })
      .populate("initiatorClub", "name logo description")
      .sort({ createdAt: -1 })
      .lean();

    // 2. Outgoing requests sent by my club
    const outgoing = await Collaboration.find({ initiatorClub: adminClubId })
      .populate("targetClub", "name logo description")
      .sort({ createdAt: -1 })
      .lean();

    // Populate entity details for both
    const populateEntity = async (items: any[]) => {
      return Promise.all(
        items.map(async (item) => {
          let entity = null;
          if (item.entityType === "event") {
            entity = await Event.findById(item.entityId).select("name image date").lean();
          } else if (item.entityType === "superevent") {
            entity = await SuperEvent.findById(item.entityId).select("name image startDate endDate").lean();
          } else if (item.entityType === "hackathon") {
            entity = await Hackathon.findById(item.entityId).select("name image status prize").lean();
          }
          return {
            ...item,
            entity,
          };
        })
      );
    };

    const populatedIncoming = await populateEntity(incoming);
    const populatedOutgoing = await populateEntity(outgoing);

    return NextResponse.json({
      incoming: populatedIncoming,
      outgoing: populatedOutgoing,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to fetch collaborations" }, { status: 500 });
  }
}

// POST /api/club-admin/collaborations - Invite a club to collaborate on an entity
export async function POST(req: NextRequest) {
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

    const adminClubId = new Types.ObjectId(session.user.adminClub);
    const body = await req.json();
    const { entityType, entityId, targetClubId, message } = body;

    if (!entityType || !entityId || !targetClubId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["event", "superevent", "hackathon"].includes(entityType)) {
      return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
    }

    const targetClubObjectId = new Types.ObjectId(targetClubId);
    if (targetClubObjectId.equals(adminClubId)) {
      return NextResponse.json({ error: "Cannot collaborate with your own club" }, { status: 400 });
    }

    // Verify entity ownership
    let entity: any = null;
    if (entityType === "event") {
      entity = await Event.findById(entityId);
    } else if (entityType === "superevent") {
      entity = await SuperEvent.findById(entityId);
    } else if (entityType === "hackathon") {
      entity = await Hackathon.findById(entityId);
    }

    if (!entity) {
      return NextResponse.json({ error: `${entityType} not found` }, { status: 404 });
    }

    if (entity.organizingClub.toString() !== adminClubId.toString()) {
      return NextResponse.json({ error: "Only the primary organizing club can invite collaborators" }, { status: 403 });
    }

    // Check if already collaborated or requested
    if (entity.collaboratingClubs && entity.collaboratingClubs.some((c: any) => c.toString() === targetClubId)) {
      return NextResponse.json({ error: "Club is already a collaborator" }, { status: 400 });
    }

    const existingCollab = await Collaboration.findOne({
      entityType,
      entityId: new Types.ObjectId(entityId),
      targetClub: targetClubObjectId,
    });

    if (existingCollab) {
      if (existingCollab.status === "pending") {
        return NextResponse.json({ error: "A collaboration request is already pending for this club" }, { status: 400 });
      }
      // If rejected earlier, allow re-requesting by updating
      existingCollab.status = "pending";
      existingCollab.message = message;
      existingCollab.initiatorClub = adminClubId;
      await existingCollab.save();
      return NextResponse.json(existingCollab, { status: 200 });
    }

    const collab = await Collaboration.create({
      entityType,
      entityId: new Types.ObjectId(entityId),
      initiatorClub: adminClubId,
      targetClub: targetClubObjectId,
      status: "pending",
      message,
    });

    return NextResponse.json(collab, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to create collaboration request" }, { status: 500 });
  }
}
