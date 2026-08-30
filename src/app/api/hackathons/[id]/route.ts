import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import { connectToDb } from "@/lib/connectToDb";
import { 
  Hackathon, 
  HackathonRound, 
  HackathonRegistration, 
  HackathonTeam, 
  Submission, 
  RoundQualification 
} from "@/models";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    await connectToDb();
    const { id } = await params;

    const hackathon = await Hackathon.findById(id)
      .populate("organizingClub")
      .populate("contact", "name email image");

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    const rounds = await HackathonRound.find({ hackathon: id }).sort({ roundNumber: 1 });
    const registrationCount = await HackathonRegistration.countDocuments({ hackathon: id });

    let myTeam = null;
    let myRegistration = null;

    if (session?.user?.id) {
      myTeam = await HackathonTeam.findOne({
        hackathon: id,
        members: session.user.id,
      })
        .populate("members", "name email image department year")
        .populate("leader", "name email image department year");

      if (myTeam) {
        myRegistration = await HackathonRegistration.findOne({
          hackathon: id,
          team: myTeam._id,
        });
      }
    }

    return NextResponse.json(
      { hackathon, rounds, registrationCount, myTeam, myRegistration },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "club-admin" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDb();
    const { id } = await params;
    const formData = await req.formData();

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    const organizingClubId = (hackathon.organizingClub?._id || hackathon.organizingClub)?.toString();
    const userAdminClubId = session?.user?.adminClub?.toString();
    if (session.user.role !== "admin" && organizingClubId !== userAdminClubId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ALLOWED_FIELDS = [
      "name", "description", "status", "prize", "maxRegistrations", 
      "isRegistrationOpen", "whatsappGroupLink", "providesCertificate", "numberOfWinners"
    ];

    const body: any = {};
    for (const [key, value] of formData.entries()) {
      if (value === "") continue;

      if (ALLOWED_FIELDS.includes(key)) {
        if (key === "providesCertificate" || key === "isRegistrationOpen") {
          body[key] = value === "true";
        } else if (["prize", "maxRegistrations", "numberOfWinners"].includes(key)) {
          body[key] = Number(value);
        } else {
          body[key] = value;
        }
      }
    }

    if (formData.has("teamSize")) {
      body.teamSize = Number(formData.get("teamSize"));
    }
    if (formData.has("teamSizeRange")) {
      try { body.teamSizeRange = JSON.parse(formData.get("teamSizeRange") as string); } catch (e) {}
    }
    if (formData.has("submissionConfig")) {
      try { body.submissionConfig = JSON.parse(formData.get("submissionConfig") as string); } catch (e) {}
    }
    if (formData.has("contact")) {
      try { body.contact = JSON.parse(formData.get("contact") as string); } catch (e) {}
    }
    if (formData.has("points")) {
      try { body.points = JSON.parse(formData.get("points") as string); } catch (e) {}
    }
    if (formData.has("customQuestions")) {
      try {
        const cq = JSON.parse(formData.get("customQuestions") as string);
        if (Array.isArray(cq)) {
          // Validate
          const ids = new Set<string>();
          let valid = true;
          for (const q of cq) {
            if (!q.id || !q.question?.trim() || ids.has(q.id) || !["text", "select", "multiselect"].includes(q.type)) {
              valid = false; break;
            }
            if (q.type !== "text" && (!q.options || q.options.filter(Boolean).length === 0)) {
              valid = false; break;
            }
            ids.add(q.id);
          }
          if (valid) body.customQuestions = cq;
        }
      } catch (e) {}
    }

    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image", folder: "hackathon-banners" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(buffer);
      });
      body.image = uploadResult.secure_url;
    }

    hackathon.set(body);
    await hackathon.save();

    return NextResponse.json(hackathon, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update hackathon" }, { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "club-admin" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDb();
    const { id } = await params;
    const hackathon = await Hackathon.findById(id);

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    const organizingClubId = (hackathon.organizingClub?._id || hackathon.organizingClub)?.toString();
    if (session.user.role !== "admin" && organizingClubId !== session?.user?.adminClub?.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (hackathon.status !== "draft") {
      return NextResponse.json({ error: "Only draft hackathons can be deleted" }, { status: 400 });
    }

    // Clean up
    await Promise.all([
      HackathonTeam.deleteMany({ hackathon: id }),
      HackathonRound.deleteMany({ hackathon: id }),
      HackathonRegistration.deleteMany({ hackathonId: id }),
      Submission.deleteMany({ hackathon: id }),
      RoundQualification.deleteMany({ hackathon: id }),
    ]);

    if (hackathon.banner) {
      // Extract public_id and delete from Cloudinary (optional but good practice)
      const parts = hackathon.banner.split("/");
      const filename = parts[parts.length - 1];
      const publicId = `hackathon-banners/${filename.split(".")[0]}`;
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await hackathon.deleteOne();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete hackathon" }, { status: 500 });
  }
};
