import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration } from "@/models";
import cloudinary from "@/lib/cloudinary";
import {
  getDefaultCertificateLayout,
  parseCertificateLayoutFromFormData,
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
      const d = date || event.date.toISOString().split("T")[0];
      const t = eventTime || `${event.date.getHours().toString().padStart(2, "0")}:${event.date.getMinutes().toString().padStart(2, "0")}`;
      
      const [year, month, day] = d.split("-").map(Number);
      const [hours, minutes] = t.split(":").map(Number);
      updateData.date = new Date(year, month - 1, day, hours, minutes);
    }

    if (formData.has("prize")) updateData.prize = Number(formData.get("prize"));
    
    const maxRegistrations = formData.get("maxRegistrations");
    if (maxRegistrations !== null) {
      const maxRegs = Number(maxRegistrations);
      if (maxRegs < 1) {
        return NextResponse.json({ error: "maxRegistrations must be >= 1" }, { status: 400 });
      }
      updateData.maxRegistrations = maxRegs;
    }

    if (formData.has("whatsappGroupLink")) updateData.whatsappGroupLink = formData.get("whatsappGroupLink") as string;
    
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

    // Certificate Template
    const removeCertificateTemplate = formData.get("removeCertificateTemplate") === "true";
    if (removeCertificateTemplate) {
      updateData.providesCertificate = false;
      updateData.$unset = { certificateTemplate: 1 };
    } else {
      const providesCertificate = formData.get("providesCertificate");
      if (providesCertificate === "true") updateData.providesCertificate = true;
      if (providesCertificate === "false") updateData.providesCertificate = false;

      const certificateTemplateFile = formData.get("certificateTemplateImage") as File | null;
      if (certificateTemplateFile && certificateTemplateFile.size > 0) {
        const certBuffer = Buffer.from(await certificateTemplateFile.arrayBuffer());
        const certUploadResult: any = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ resource_type: "image", folder: "certificates" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }).end(certBuffer);
        });

        const certificateLayoutResult = parseCertificateLayoutFromFormData(formData);
        
        updateData.certificateTemplate = {
          url: certUploadResult.secure_url,
          publicId: certUploadResult.public_id,
          uploadedAt: new Date(),
          layout: certificateLayoutResult.layout ?? getDefaultCertificateLayout(),
        };
        updateData.providesCertificate = true;
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData.certificateTemplate ? { ...updateData } : updateData,
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
