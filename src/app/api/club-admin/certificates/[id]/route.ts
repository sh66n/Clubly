import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Certificate } from "@/models/certificate.model";
import { Event } from "@/models";
import cloudinary from "@/lib/cloudinary";
import { parseCertificateLayoutFromFormData } from "@/lib/certificate";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const certificate = await Certificate.findById(id).lean();

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    if (certificate.club.toString() !== session.user.adminClub.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(certificate, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/club-admin/certificates/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    if (certificate.club.toString() !== session.user.adminClub.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const updateData: any = {};

    const name = formData.get("name") as string;
    if (name) updateData.name = name;

    const certificateTemplateFile = formData.get("certificateTemplateImage") as File | null;
    if (certificateTemplateFile && certificateTemplateFile.size > 0) {
      const certBuffer = Buffer.from(await certificateTemplateFile.arrayBuffer());
      const certUploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image", folder: "certificates" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(certBuffer);
      });
      updateData.url = certUploadResult.secure_url;
      updateData.publicId = certUploadResult.public_id;
      updateData.uploadedAt = new Date();
    }

    const certificateLayoutResult = parseCertificateLayoutFromFormData(formData);
    if (certificateLayoutResult.layout) {
      updateData.layout = certificateLayoutResult.layout;
    }

    const updatedCertificate = await Certificate.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json(updatedCertificate, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/club-admin/certificates/[id] error:", error);
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
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    if (certificate.club.toString() !== session.user.adminClub.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const eventsCount = await Event.countDocuments({ certificate: id });
    if (eventsCount > 0) {
      return NextResponse.json({ error: "Cannot delete certificate used by events" }, { status: 400 });
    }

    if (certificate.publicId) {
      await cloudinary.uploader.destroy(certificate.publicId);
    }
    await Certificate.findByIdAndDelete(id);

    return NextResponse.json({ message: "Certificate deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/club-admin/certificates/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
