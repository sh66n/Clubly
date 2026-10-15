import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration, Club, Feedback, Payment, User, Group } from "@/models";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDb();
    const session = await auth();

    if (
      !session ||
      session.user.role !== "faculty-coordinator" ||
      !session.user.adminClub
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const event = await Event.findById(eventId)
      .populate("organizingClub", "name fullName department logo facultyCoordinator lastNaacSignatures")
      .populate("collaboratingClubs", "name fullName department logo")
      .populate("contact", "name email phoneNumber")
      .populate("winner", "name email department year college")
      .populate("winnerGroup", "name members leader")
      .populate("winners.user", "name email department year college")
      .populate("winners.group", "name members leader")
      .lean();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verify organizing club belongs to this coordinator
    if (
      (event.organizingClub as any)?._id?.toString() !== session.user.adminClub.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Attendance & Registrations with student demographics
    const registrations = await Registration.find({ eventId })
      .populate("userId", "name email department year college")
      .populate({
        path: "groupId",
        select: "name members leader",
        populate: [
          { path: "members", select: "name email department year college" },
          { path: "leader", select: "name email department year college" },
        ],
      })
      .lean();

    const totalRegistrations = registrations.length;
    const totalAttended = registrations.filter((r: any) => r.status === "attended").length;
    const attendanceRate = totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0;

    // Aggregate demographics (all participating students, accounting for teams and individuals)
    const departmentCounts: Record<string, number> = {};
    const yearCounts: Record<string, number> = {
      FE: 0,
      SE: 0,
      TE: 0,
      BE: 0,
    };
    const seenUserIds = new Set<string>();

    const recordStudent = (student: any) => {
      if (!student || !student._id) return;
      const sId = student._id.toString();
      if (seenUserIds.has(sId)) return;
      seenUserIds.add(sId);

      const dept = student.department || "Other";
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;

      const yr = student.year;
      if (yr === 1 || yr === "1" || yr === "FE") yearCounts.FE += 1;
      else if (yr === 2 || yr === "2" || yr === "SE") yearCounts.SE += 1;
      else if (yr === 3 || yr === "3" || yr === "TE") yearCounts.TE += 1;
      else if (yr === 4 || yr === "4" || yr === "BE") yearCounts.BE += 1;
    };

    for (const reg of registrations) {
      if (reg.groupId && (reg.groupId as any).members) {
        for (const m of (reg.groupId as any).members) {
          recordStudent(m);
        }
        if ((reg.groupId as any).leader) {
          recordStudent((reg.groupId as any).leader);
        }
      } else if (reg.userId) {
        recordStudent(reg.userId);
      }
    }

    const uniqueStudentCount = seenUserIds.size || totalRegistrations;
    const sortedDepartments = Object.entries(departmentCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: uniqueStudentCount > 0 ? Math.round((count / uniqueStudentCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const yearWiseBreakdown = [
      { year: "First Year (FE)", count: yearCounts.FE },
      { year: "Second Year (SE)", count: yearCounts.SE },
      { year: "Third Year (TE)", count: yearCounts.TE },
      { year: "Final Year (BE)", count: yearCounts.BE },
    ];

    // 2. Roll of Honour / Winners
    const winnersList: any[] = [];
    if (event.winners && event.winners.length > 0) {
      for (const w of event.winners) {
        const title = w.position === 1 ? "1st Place (Winner)" : w.position === 2 ? "2nd Place (Runner-up)" : "3rd Place";
        if (w.group) {
          winnersList.push({
            position: w.position,
            title,
            name: (w.group as any).name || "Team",
            type: "Team",
            department: (w.group as any).leader?.department || "Multidisciplinary",
            year: (w.group as any).leader?.year ? `Year ${(w.group as any).leader.year}` : "N/A",
          });
        } else if (w.user) {
          winnersList.push({
            position: w.position,
            title,
            name: (w.user as any).name,
            type: "Individual",
            department: (w.user as any).department || "Engineering",
            year: (w.user as any).year ? `Year ${(w.user as any).year}` : "N/A",
          });
        }
      }
    } else if (event.winnerGroup) {
      winnersList.push({
        position: 1,
        title: "1st Place (Winner)",
        name: (event.winnerGroup as any).name,
        type: "Team",
        department: "Multidisciplinary",
        year: "N/A",
      });
    } else if (event.winner) {
      winnersList.push({
        position: 1,
        title: "1st Place (Winner)",
        name: (event.winner as any).name,
        type: "Individual",
        department: (event.winner as any).department || "Engineering",
        year: (event.winner as any).year ? `Year ${(event.winner as any).year}` : "N/A",
      });
    }

    // 3. Financial Statement & Budget
    const payments = await Payment.find({ eventId, status: "paid" }).lean();
    // Payment amount in DB is stored in paise (Razorpay integer format)
    const totalPaise = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalRevenue = Math.round(totalPaise / 100);
    const registrationFee = event.registrationFee || 0;
    const prizeMoney = event.prize || 0;

    // 4. Feedback & Quality Rating
    const feedbacks = await Feedback.find({ eventId })
      .populate("userId", "name email department")
      .populate("feedbackFormId", "name questions")
      .sort({ createdAt: -1 })
      .lean();

    const totalFeedbacks = feedbacks.length;
    let averageRating = 0;
    let highRatingCount = 0; // 4 or 5 stars

    if (totalFeedbacks > 0) {
      const sumRatings = feedbacks.reduce((acc, fb) => acc + (fb.rating || 0), 0);
      averageRating = Number((sumRatings / totalFeedbacks).toFixed(1));
      highRatingCount = feedbacks.filter((fb) => (fb.rating || 0) >= 4).length;
    }
    const satisfactionRate = totalFeedbacks > 0 ? Math.round((highRatingCount / totalFeedbacks) * 100) : 100;

    // Curate up to 4 constructive feedback testimonials
    const studentTestimonials = feedbacks
      .filter((fb) => fb.comment && fb.comment.trim().length > 10)
      .slice(0, 4)
      .map((fb) => ({
        name: (fb.userId as any)?.name || "Student Participant",
        department: (fb.userId as any)?.department || "Engineering",
        rating: fb.rating || 5,
        comment: fb.comment?.trim(),
      }));

    // Default structure matching sample CODEZIA report format
    const organizingClubName = (event.organizingClub as any)?.fullName || (event.organizingClub as any)?.name || "Department Club";
    const departmentName = (event.organizingClub as any)?.department || "Computer Engineering";

    // Auto-generate standard objective & outcomes bullet points based on event details
    const defaultObjectives = [
      `To provide a platform for students to showcase their technical, creative, and problem-solving abilities through ${event.name}.`,
      "To encourage teamwork and collaboration among participants across academic years.",
      "To enhance practical exposure and prepare students for competitive, industry-relevant challenges.",
    ];

    const defaultLearningOutcomes = [
      "Students gained hands-on experience in tackling challenging problems under timed conditions.",
      "The event fostered peer learning, critical thinking, and innovative approaches to problem solving.",
      "Participants developed greater confidence in applying their core academic concepts in competitive scenarios.",
    ];

    // Format date string for the overview
    const eventDateObj = new Date(event.date);
    const formattedDateFull = eventDateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const collabClubsNames = ((event.collaboratingClubs as any[]) || []).map(
      (c) => c.fullName || c.name
    );
    const collabText =
      collabClubsNames.length > 0
        ? ` in collaboration with ${collabClubsNames.join(", ")}`
        : "";

    // Generate comprehensive 3-paragraph overview matching CODEZIA.pdf structure
    const p1 = `The technical event ${event.name} was successfully organized on ${formattedDateFull} by the ${organizingClubName}${collabText} at Vasantdada Patil Pratishthan's College of Engineering and Visual Arts.`;
    const p2 = event.description
      ? event.description
      : `The event was filled with creativity, logic, and teamwork as students across various engineering years participated in multiple rounds of engaging technical challenges. The event aimed to encourage problem-solving, innovation, and collaborative learning.`;
    const p3 = `The competition brought together passionate participants demonstrating skills ranging from technical problem-solving and domain aptitude to creativity and teamwork in competitive scenarios.`;

    const overviewParagraphs = [p1, p2, p3];

    return NextResponse.json({
      report: {
        instituteName: "Vasantdada Patil Pratishthan's College of Engineering and Visual Arts",
        location: "Sion, Mumbai",
        departmentName: `DEPARTMENT OF ${departmentName.toUpperCase()}`,
        eventName: event.name,
        date: event.date,
        facultyCoordinatorName: session.user.name || "Faculty Coordinator",
        organizingClubName,
        organizingClubLogo: (event.organizingClub as any)?.logo || null,
        collaboratingClubs: collabClubsNames,
        overviewParagraphs,
        description: overviewParagraphs.join("\n\n"),
        objectives: defaultObjectives,
        learningOutcomes: defaultLearningOutcomes,
        stats: {
          totalRegistrations,
          totalAttended,
          attendanceRate,
          uniqueStudentCount,
        },
        demographics: {
          departments: sortedDepartments,
          yearWise: yearWiseBreakdown,
        },
        winners: winnersList,
        financials: {
          registrationFee,
          totalRevenue,
          prizeMoney,
          paidTransactionsCount: payments.length,
        },
        feedbackSummary: {
          totalFeedbacks,
          averageRating,
          satisfactionRate,
          testimonials: studentTestimonials,
        },
        eventPhotos: (event as any).eventPhotos || [],
        naacSignatures: (event as any).naacSignatures || null,
        lastUsedSignatures: (event.organizingClub as any)?.lastNaacSignatures || null,
      },
    });
  } catch (error: any) {
    console.error("GET naac-report error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDb();
    const session = await auth();

    if (
      !session ||
      session.user.role !== "faculty-coordinator" ||
      !session.user.adminClub
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, signatures } = body;

    if (!eventId || !Array.isArray(signatures)) {
      return NextResponse.json(
        { error: "eventId and signatures array are required" },
        { status: 400 }
      );
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventClubId = (event.organizingClub?._id || event.organizingClub)?.toString();
    const userClubId = session.user.adminClub?.toString();

    if (eventClubId !== userClubId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cleanSignatures = signatures.map((s: any) => ({
      name: String(s.name || "").trim(),
      position: String(s.position || "").trim(),
      signatureUrl: String(s.signatureUrl || "").trim(),
    }));

    // 1. Save specifically to this event
    await Event.findByIdAndUpdate(eventId, {
      $set: { naacSignatures: cleanSignatures },
    });

    // 2. Remember this as the last used signature block for the club
    if (userClubId) {
      await Club.findByIdAndUpdate(userClubId, {
        $set: { lastNaacSignatures: cleanSignatures },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Signatures saved successfully",
      signatures: cleanSignatures,
    });
  } catch (error: any) {
    console.error("POST naac-report error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
