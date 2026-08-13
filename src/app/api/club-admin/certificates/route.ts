import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Certificate } from "@/models/certificate.model";
import cloudinary from "@/lib/cloudinary";
import {
  getDefaultCertificateLayout,
  parseCertificateLayoutFromFormData,
} from "@/lib/certificate";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClubId = session.user.adminClub;
    const certificates = await Certificate.find({ club: adminClubId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(certificates, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/club-admin/certificates error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClubId = session.user.adminClub;
    const formData = await req.formData();
    const name = formData.get("name") as string;
    
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const certificateTemplateFile = formData.get("certificateTemplateImage") as File | null;
    if (!certificateTemplateFile || certificateTemplateFile.size === 0) {
      return NextResponse.json({ error: "Certificate image is required" }, { status: 400 });
    }

    const certBuffer = Buffer.from(await certificateTemplateFile.arrayBuffer());
    const certUploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: "image", folder: "certificates" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(certBuffer);
    });

    const certificateLayoutResult = parseCertificateLayoutFromFormData(formData);

    const newCertificate = await Certificate.create({
      club: adminClubId,
      name,
      url: certUploadResult.secure_url,
      publicId: certUploadResult.public_id,
      uploadedAt: new Date(),
      layout: certificateLayoutResult.layout ?? getDefaultCertificateLayout(),
    });

    return NextResponse.json(newCertificate, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/club-admin/certificates error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
