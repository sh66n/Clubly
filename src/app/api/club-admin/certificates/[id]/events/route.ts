import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models/event.model";
import { Certificate } from "@/models/certificate.model";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: certId } = await params;
    await connectToDb();

    // Verify certificate belongs to this club
    const certificate = await Certificate.findOne({
      _id: certId,
      club: session.user.adminClub,
    }).lean();

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Get all events organized by this club
    const events = await Event.find({ organizingClub: session.user.adminClub })
      .select("_id name date providesCertificate certificate")
      .sort({ date: -1 })
      .lean();

    const formattedEvents = events.map((event) => ({
      _id: event._id.toString(),
      name: event.name,
      date: event.date,
      providesCertificate: Boolean(event.providesCertificate),
      isLinked: event.certificate?.toString() === certId,
      isLinkedToOther:
        Boolean(event.certificate) && event.certificate?.toString() !== certId,
    }));

    return NextResponse.json({ events: formattedEvents }, { status: 200 });
  } catch (error) {
    console.error("GET /api/club-admin/certificates/[id]/events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch linked events" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: certId } = await params;
    const body = await req.json();
    const eventIds: string[] = Array.isArray(body.eventIds) ? body.eventIds : [];

    await connectToDb();

    // Verify certificate belongs to this club
    const certificate = await Certificate.findOne({
      _id: certId,
      club: session.user.adminClub,
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // 1. Link selected events to this certificate
    if (eventIds.length > 0) {
      await Event.updateMany(
        {
          _id: { $in: eventIds },
          organizingClub: session.user.adminClub,
        },
        {
          $set: {
            certificate: certificate._id,
            providesCertificate: true,
          },
        }
      );
    }

    // 2. Unlink any events from this certificate that were not selected
    await Event.updateMany(
      {
        organizingClub: session.user.adminClub,
        certificate: certificate._id,
        _id: { $nin: eventIds },
      },
      {
        $set: { providesCertificate: false },
        $unset: { certificate: 1 },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: `Successfully updated certificate event links (${eventIds.length} linked)`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/club-admin/certificates/[id]/events error:", error);
    return NextResponse.json(
      { error: "Failed to update linked events" },
      { status: 500 }
    );
  }
}
