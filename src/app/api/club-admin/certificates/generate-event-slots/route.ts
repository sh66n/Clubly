import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Certificate, CertificateFolder } from "@/models";
import { getDefaultCertificateLayout } from "@/lib/certificate";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, numberOfWinners: customWinners } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const clubId = session.user.adminClub.toString();
    const eventClubId = (event.organizingClub?._id || event.organizingClub)?.toString();

    if (eventClubId !== clubId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find or create CertificateFolder
    let folder = await CertificateFolder.findOne({
      $or: [{ event: event._id }, { name: `Event: ${event.name}`, club: clubId }],
    });

    if (!folder) {
      folder = await CertificateFolder.create({
        club: clubId,
        name: `Event: ${event.name}`,
        event: event._id,
      });
    } else if (!folder.event) {
      folder.event = event._id;
      await folder.save();
    }

    const layout = getDefaultCertificateLayout();
    const winnersCount = Number(customWinners || event.numberOfWinners || 1);

    const currentCerts = event.certificatesByPosition || {};
    const updatedCertsByPosition: Record<string, any> = { ...currentCerts };

    // 1. Participant Slot
    if (!updatedCertsByPosition.participation) {
      const partCert = await Certificate.create({
        club: clubId,
        folder: folder._id,
        name: `${event.name} - Participant`,
        url: "",
        publicId: "",
        isDraft: true,
        layout,
      });
      updatedCertsByPosition.participation = partCert._id;
    }

    // 2. Winner Slots
    for (let i = 1; i <= winnersCount; i++) {
      const posKey = i === 1 ? "first" : i === 2 ? "second" : "third";
      if (!updatedCertsByPosition[posKey]) {
        const cert = await Certificate.create({
          club: clubId,
          folder: folder._id,
          name: `${event.name} - ${i}${i === 1 ? 'st' : i === 2 ? 'nd' : 'rd'} Place`,
          url: "",
          publicId: "",
          isDraft: true,
          layout,
        });
        updatedCertsByPosition[posKey] = cert._id;
      }
    }

    event.providesCertificate = true;
    event.numberOfWinners = winnersCount;
    event.certificatesByPosition = updatedCertsByPosition;
    await event.save();

    return NextResponse.json(
      {
        success: true,
        message: `Created certificate folder and slots for ${event.name}`,
        folderId: folder._id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/club-admin/certificates/generate-event-slots error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
