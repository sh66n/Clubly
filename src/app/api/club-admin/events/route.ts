import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Payment, Registration, Feedback, Club } from "@/models";
import cloudinary from "@/lib/cloudinary";
import {
  getDefaultCertificateLayout,
  parseCertificateLayoutFromFormData,
  validateCertificateTemplateFile,
} from "@/lib/certificate";
import { sendMail } from "@/services/sendMail";

export const dynamic = "force-dynamic";

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

    const adminClubId = session.user.adminClub;
    const { searchParams } = new URL(req.url);
    const selectedAcademicYear = searchParams.get("academicYear"); // e.g. "2026" for 2026-2027

    // Fetch all events first to compute available academic years dynamically
    const allClubEvents = await Event.find({ organizingClub: adminClubId }).select("date").lean();
    
    // Determine available academic years
    const availableYearsSet = new Set<string>();
    allClubEvents.forEach((ev: any) => {
      const d = new Date(ev.date);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-indexed: 6 is July
      // Academic cycle runs from July to June
      const acadYear = month >= 6 ? year : year - 1;
      availableYearsSet.add(`${acadYear}-${acadYear + 1}`);
    });
    const availableAcademicYears = Array.from(availableYearsSet).sort().reverse();

    // Construct query with academic cycle bounds if specified
    const query: any = { organizingClub: adminClubId };
    if (selectedAcademicYear && selectedAcademicYear.includes("-")) {
      const [startYearStr] = selectedAcademicYear.split("-");
      const startYear = Number(startYearStr);
      if (!isNaN(startYear)) {
        const cycleStart = new Date(startYear, 6, 1, 0, 0, 0, 0); // July 1st of startYear
        const cycleEnd = new Date(startYear + 1, 5, 30, 23, 59, 59, 999); // June 30th of next year
        query.date = { $gte: cycleStart, $lte: cycleEnd };
      }
    }

    const events = await Event.find(query).sort({
      createdAt: -1,
    }).lean();

    const stats = {
      totalEvents: events.length,
      liveEvents: 0,
      draftEvents: 0,
      completedEvents: 0,
      totalRegistrations: 0,
      totalRevenue: 0,
    };

    const eventsWithStats = await Promise.all(
      events.map(async (event: any) => {
        // Fallback status derivation if missing from db document
        if (!event.status) {
          const eventDate = new Date(event.date);
          const now = new Date();
          if (event.isRegistrationOpen === false) {
            event.status = "completed";
          } else if (eventDate < now) {
            event.status = "completed";
          } else {
            event.status = "live";
          }
        }

        if (event.status === "live") stats.liveEvents++;
        else if (event.status === "draft") stats.draftEvents++;
        else if (event.status === "completed") stats.completedEvents++;

        // Registration Count
        let registrationCount = 0;
        if (event.eventType === "team") {
          const uniqueGroups = await Registration.distinct("groupId", {
            eventId: event._id,
            groupId: { $ne: null },
          });
          registrationCount = uniqueGroups.length;
        } else {
          registrationCount = await Registration.countDocuments({
            eventId: event._id,
          });
        }

        // Revenue
        const payments = await Payment.find({
          eventId: event._id,
          status: "paid",
        });
        const revenue = payments.reduce((acc, p) => acc + (p.amount / 100), 0);

        // Feedback
        const feedbacks = await Feedback.find({ eventId: event._id });
        const feedbackCount = feedbacks.length;
        const avgRating =
          feedbackCount > 0
            ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbackCount
            : 0;

        stats.totalRegistrations += registrationCount;
        stats.totalRevenue += revenue;

        return {
          ...event,
          registrationCount,
          revenue,
          feedbackCount,
          avgRating,
        };
      })
    );

    return NextResponse.json(
      { stats, events: eventsWithStats, availableAcademicYears },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/club-admin/events error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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

    const organizingClub = session.user.adminClub;
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const eventTime = (formData.get("eventTime") as string) || "00:00";
    const status = (formData.get("status") as string) || "live";

    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = eventTime.split(":").map(Number);
    const eventDate = new Date(year, month - 1, day, hours, minutes);

    const eventType = formData.get("eventType") as string;
    const teamSize = formData.get("teamSize") as string | null;
    const teamSizeMin = formData.get("teamSizeRange[min]") as string | null;
    const teamSizeMax = formData.get("teamSizeRange[max]") as string | null;
    
    let finalTeamSize: number | undefined = undefined;
    let teamSizeRange: { min: number; max: number } | undefined = undefined;

    if (eventType === "individual") {
      finalTeamSize = 1;
    }

    if (eventType === "team") {
      if (teamSizeMin && teamSizeMax) {
        teamSizeRange = { min: Number(teamSizeMin), max: Number(teamSizeMax) };
      } else if (teamSize) {
        finalTeamSize = Number(teamSize);
      }
    }

    const prize = formData.get("prize") as string | null;
    const providesCertificate = formData.get("providesCertificate") === "true";
    const registrationFee = formData.get("registrationFee") as string | null;
    const maxRegistrations = formData.get("maxRegistrations") as string | null;
    const whatsappGroupLink = formData.get("whatsappGroupLink") as string | null;
    const customQuestionsRaw = formData.get("customQuestions") as string | null;
    
    let customQuestions: any[] = [];
    if (customQuestionsRaw) {
      try {
        customQuestions = JSON.parse(customQuestionsRaw);
      } catch (err) {
        return NextResponse.json({ error: "Invalid custom questions" }, { status: 400 });
      }
    }

    const certificateLayoutResult = parseCertificateLayoutFromFormData(formData);
    
    // Upload image
    const file = formData.get("image") as unknown as File | null;
    let imageUrl = "";
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    // Upload certificate
    const certificateTemplateFile = formData.get("certificateTemplateImage") as File | null;
    let certificateTemplate: any = undefined;

    if (providesCertificate && certificateTemplateFile && certificateTemplateFile.size > 0) {
      const certBuffer = Buffer.from(await certificateTemplateFile.arrayBuffer());
      const certUploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image", folder: "certificates" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(certBuffer);
      });

      certificateTemplate = {
        url: certUploadResult.secure_url,
        publicId: certUploadResult.public_id,
        uploadedAt: new Date(),
        layout: certificateLayoutResult.layout ?? getDefaultCertificateLayout(),
      };
    }

    const newEvent = await Event.create({
      organizingClub,
      name,
      description,
      date: eventDate,
      eventType,
      teamSize: finalTeamSize,
      teamSizeRange,
      prize: prize ? Number(prize) : undefined,
      providesCertificate,
      registrationFee: registrationFee ? Number(registrationFee) : 0,
      image: imageUrl,
      maxRegistrations: maxRegistrations ? Number(maxRegistrations) : undefined,
      whatsappGroupLink: whatsappGroupLink || undefined,
      customQuestions,
      certificateTemplate,
      status,
      isRegistrationOpen: status === "live",
    });

    if (status === "live") {
      try {
        const club = await Club.findById(organizingClub).populate("bellFollowers");
        if (club && club.bellFollowers && club.bellFollowers.length > 0) {
          const emails = club.bellFollowers.map((u: any) => u.email).filter(Boolean);
          if (emails.length > 0) {
            await sendMail(
              emails,
              `New Event by ${club.name}: ${name}`,
              `Hello!<br><br>${club.name} just added a new event: ${name} which is scheduled for ${eventDate.toDateString()}.<br><br>Check it out on Clubly!`
            );
          }
        }
      } catch (err) {
        console.error("Failed to send email notification", err);
      }
    }

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/club-admin/events error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
