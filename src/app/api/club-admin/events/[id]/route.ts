import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration } from "@/models";
import cloudinary from "@/lib/cloudinary";
import {
  getDefaultCertificateLayout,
} from "@/lib/certificate";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizingClub.toString() !== session.user.adminClub.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const updateData: any = {};

    if (formData.has("name")) updateData.name = formData.get("name") as string;
    if (formData.has("description")) updateData.description = formData.get("description") as string;
    
    const date = formData.get("date") as string;
    const eventTime = formData.get("eventTime") as string;
    
    if (date || eventTime) {
      const d = date || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(event.date));
      const t = eventTime || new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(event.date));
      
      updateData.date = new Date(`${d}T${t}:00+05:30`);
    }

    if (formData.has("registrationDeadline")) {
      const rdDate = formData.get("registrationDeadline") as string;
      const rdTime = (formData.get("registrationDeadlineTime") as string) || "23:59";
      if (rdDate) {
        updateData.registrationDeadline = new Date(`${rdDate}T${rdTime}:00+05:30`);
      } else {
        updateData.$unset = { ...(updateData.$unset || {}), registrationDeadline: 1 };
      }
    }

    if (formData.has("registrationFee")) {
      updateData.registrationFee = Number(formData.get("registrationFee") || 0);
    }

    if (formData.has("status")) {
      const status = formData.get("status") as string;
      if (["draft", "live", "completed"].includes(status)) {
        updateData.status = status;
        updateData.isRegistrationOpen = status === "live";
      }
    }

    const eventType = formData.get("eventType") as string | null;
    const teamSizeMin = formData.get("teamSizeRange[min]") as string | null;
    const teamSizeMax = formData.get("teamSizeRange[max]") as string | null;
    const teamSize = formData.get("teamSize") as string | null;

    if (eventType === "individual") {
      updateData.eventType = "individual";
      updateData.teamSize = 1;
      updateData.$unset = { ...(updateData.$unset || {}), teamSizeRange: 1 };
      delete updateData.teamSizeRange;
    } else if (eventType === "team") {
      updateData.eventType = "team";
      if (teamSizeMin && teamSizeMax) {
        const min = Number(teamSizeMin);
        const max = Number(teamSizeMax);
        if (isNaN(min) || isNaN(max) || min < 1 || max < min) {
          return NextResponse.json({ error: "Invalid team size range" }, { status: 400 });
        }
        updateData.teamSizeRange = { min, max };
        updateData.$unset = { ...(updateData.$unset || {}), teamSize: 1 };
        delete updateData.teamSize;
      } else if (teamSize) {
        const ts = Number(teamSize);
        if (isNaN(ts) || ts < 1) {
          return NextResponse.json({ error: "Invalid team size" }, { status: 400 });
        }
        updateData.teamSize = ts;
        updateData.$unset = { ...(updateData.$unset || {}), teamSizeRange: 1 };
        delete updateData.teamSizeRange;
      }
    } else {
      if (teamSizeMin && teamSizeMax) {
        const min = Number(teamSizeMin);
        const max = Number(teamSizeMax);
        if (isNaN(min) || isNaN(max) || min < 1 || max < min) {
          return NextResponse.json({ error: "Invalid team size range" }, { status: 400 });
        }
        updateData.teamSizeRange = { min, max };
        updateData.$unset = { ...(updateData.$unset || {}), teamSize: 1 };
        delete updateData.teamSize;
      } else if (teamSize) {
        const ts = Number(teamSize);
        if (isNaN(ts) || ts < 1) {
          return NextResponse.json({ error: "Invalid team size" }, { status: 400 });
        }
        updateData.teamSize = ts;
        updateData.$unset = { ...(updateData.$unset || {}), teamSizeRange: 1 };
        delete updateData.teamSizeRange;
      }
    }

    if (formData.has("prize")) updateData.prize = Number(formData.get("prize"));

    if (formData.has("numberOfWinners")) {
      const nw = Number(formData.get("numberOfWinners"));
      if (nw >= 1 && nw <= 3) {
        updateData.numberOfWinners = nw;
      }
    }
    
    const maxRegistrations = formData.get("maxRegistrations");
    if (maxRegistrations !== null) {
      const maxRegs = Number(maxRegistrations);
      if (maxRegs < 1) {
        return NextResponse.json({ error: "maxRegistrations must be >= 1" }, { status: 400 });
      }
      updateData.maxRegistrations = maxRegs;
    }

    if (formData.has("whatsappGroupLink")) updateData.whatsappGroupLink = formData.get("whatsappGroupLink") as string;
    
    if (formData.has("superEvent")) {
      const seVal = formData.get("superEvent") as string;
      if (seVal && seVal.trim() !== "" && seVal !== "undefined" && seVal !== "null") {
        updateData.superEvent = seVal.trim();
      } else {
        updateData.$unset = { ...(updateData.$unset || {}), superEvent: 1 };
      }
    }
    
    const customQuestionsRaw = formData.get("customQuestions") as string | null;
    if (customQuestionsRaw) {
      try {
        updateData.customQuestions = JSON.parse(customQuestionsRaw);
      } catch (err) {
        return NextResponse.json({ error: "Invalid custom questions" }, { status: 400 });
      }
    }

    // Image Upload
    const file = formData.get("image") as unknown as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(buffer);
      });
      updateData.image = uploadResult.secure_url;
    }

    // Certificate Handling
    const removeCertificateTemplate = formData.get("removeCertificateTemplate") === "true";
    if (removeCertificateTemplate) {
      updateData.providesCertificate = false;
      updateData.$unset = { certificate: 1 };
    } else {
      const providesCertificate = formData.get("providesCertificate");
      if (providesCertificate === "true") updateData.providesCertificate = true;
      if (providesCertificate === "false") updateData.providesCertificate = false;

      const certificateId = formData.get("certificateId") as string | null;
      if (providesCertificate === "true" && certificateId) {
        updateData.certificate = certificateId;
      } else if (providesCertificate === "false") {
        updateData.$unset = { certificate: 1 };
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error: any) {
    console.error(`PATCH /api/club-admin/events/[id] error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizingClub.toString() !== session.user.adminClub.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const registrationCount = await Registration.countDocuments({ eventId: id });

    if (event.status !== "draft" && registrationCount > 0) {
      return NextResponse.json({ error: "Cannot delete event with registrations" }, { status: 400 });
    }

    await Registration.deleteMany({ eventId: id });
    await Event.findByIdAndDelete(id);

    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`DELETE /api/club-admin/events/[id] error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
