import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Club } from "@/models";
import { sendMail } from "@/services/sendMail";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const newStatus = body.status;

    if (!["live", "completed"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizingClub.toString() !== session.user.adminClub.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const currentStatus = event.status;

    if (currentStatus === "live" && newStatus === "completed") {
      event.status = "completed";
      event.isRegistrationOpen = false;
    } else if (currentStatus === "completed" && newStatus === "live") {
      event.status = "live";
      event.isRegistrationOpen = true;
    } else if (currentStatus === "draft" && newStatus === "live") {
      event.status = "live";
      event.isRegistrationOpen = true;
      
      // Send email notification when transitioning from draft to live
      try {
        const club = await Club.findById(event.organizingClub).populate("bellFollowers");
        if (club && club.bellFollowers && club.bellFollowers.length > 0) {
          const emails = club.bellFollowers.map((u: any) => u.email).filter(Boolean);
          if (emails.length > 0) {
            await sendMail(
              emails,
              `New Event by ${club.name}: ${event.name}`,
              `Hello!<br><br>${club.name} just added a new event: ${event.name} which is scheduled for ${event.date.toDateString()}.<br><br>Check it out on Clubly!`
            );
          }
        }
      } catch (err) {
        console.error("Failed to send email notification", err);
      }
    } else {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
    }

    await event.save();

    return NextResponse.json(event, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/club-admin/events/[id]/status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
