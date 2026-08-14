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
      .select("_id name date providesCertificate certificate certificatesByPosition")
      .sort({ date: -1 })
      .lean();

    const formattedEvents = events.map((event: any) => {
      const isBaseLinked = event.certificate?.toString() === certId;
      const isPartLinked = event.certificatesByPosition?.participation?.toString() === certId;
      const isFirstLinked = event.certificatesByPosition?.first?.toString() === certId;
      const isSecondLinked = event.certificatesByPosition?.second?.toString() === certId;
      const isThirdLinked = event.certificatesByPosition?.third?.toString() === certId;

      const isLinked = isBaseLinked || isPartLinked || isFirstLinked || isSecondLinked || isThirdLinked;

      const otherLinked = Boolean(
        (event.certificate && !isBaseLinked) ||
        (event.certificatesByPosition?.participation && !isPartLinked)
      );

      return {
        _id: event._id.toString(),
        name: event.name,
        date: event.date,
        providesCertificate: Boolean(event.providesCertificate),
        isLinked,
        isLinkedToOther: otherLinked,
      };
    });

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

    const certNameLower = (certificate.name || "").toLowerCase();
    const isFirst = certNameLower.includes("1st") || certNameLower.includes("first");
    const isSecond = certNameLower.includes("2nd") || certNameLower.includes("second");
    const isThird = certNameLower.includes("3rd") || certNameLower.includes("third");

    // 1. Link selected events to this certificate
    if (eventIds.length > 0) {
      const setPayload: Record<string, any> = { providesCertificate: true };
      if (isFirst) {
        setPayload["certificatesByPosition.first"] = certificate._id;
      } else if (isSecond) {
        setPayload["certificatesByPosition.second"] = certificate._id;
      } else if (isThird) {
        setPayload["certificatesByPosition.third"] = certificate._id;
      } else {
        setPayload.certificate = certificate._id;
        setPayload["certificatesByPosition.participation"] = certificate._id;
      }

      await Event.updateMany(
        {
          _id: { $in: eventIds },
          organizingClub: session.user.adminClub,
        },
        { $set: setPayload }
      );
    }

    // 2. Unlink any events from this certificate that were unselected
    const unsetPayload: Record<string, any> = {};
    if (isFirst) {
      unsetPayload["certificatesByPosition.first"] = 1;
    } else if (isSecond) {
      unsetPayload["certificatesByPosition.second"] = 1;
    } else if (isThird) {
      unsetPayload["certificatesByPosition.third"] = 1;
    } else {
      unsetPayload.certificate = 1;
      unsetPayload["certificatesByPosition.participation"] = 1;
    }

    await Event.updateMany(
      {
        organizingClub: session.user.adminClub,
        _id: { $nin: eventIds },
        $or: [
          { certificate: certificate._id },
          { "certificatesByPosition.participation": certificate._id },
          { "certificatesByPosition.first": certificate._id },
          { "certificatesByPosition.second": certificate._id },
          { "certificatesByPosition.third": certificate._id },
        ],
      },
      { $unset: unsetPayload }
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
