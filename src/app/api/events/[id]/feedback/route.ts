import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Feedback, FeedbackForm } from "@/models";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDb();

    const event = await Event.findById(id)
      .select("feedbackForm certificate certificatesByPosition certificateTemplate name eventType winner winnerGroup winners")
      .lean();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    let position = 0;
    const userIdStr = session.user.id.toString();

    if (event.eventType === "individual") {
      const match = (event.winners || []).find(
        (w: any) => (w.user?._id || w.user)?.toString() === userIdStr
      );
      if (match) position = match.position;
      else if ((event.winner?._id || event.winner)?.toString() === userIdStr) position = 1;
    } else {
      const { Group } = await import("@/models");
      const group = await Group.findOne({
        event: event._id,
        members: session.user.id,
      }).select("_id");

      if (group) {
        const groupIdStr = group._id.toString();
        const match = (event.winners || []).find(
          (w: any) => (w.group?._id || w.group)?.toString() === groupIdStr
        );
        if (match) position = match.position;
        else if ((event.winnerGroup?._id || event.winnerGroup)?.toString() === groupIdStr) position = 1;
      }
    }

    const posCerts: any = (event as any).certificatesByPosition;
    let targetCertId: any = null;

    if (position === 1 && posCerts?.first) {
      targetCertId = posCerts.first;
    } else if (position === 2 && posCerts?.second) {
      targetCertId = posCerts.second;
    } else if (position === 3 && posCerts?.third) {
      targetCertId = posCerts.third;
    } else {
      targetCertId = posCerts?.participation || (event as any).certificate;
    }

    let certObj: any = null;
    const certIdStr = typeof targetCertId === "object" ? targetCertId?._id?.toString() : targetCertId?.toString();
    if (certIdStr) {
      const { Certificate } = await import("@/models");
      certObj = await Certificate.findById(certIdStr).lean();
    }
    if (!certObj && (event as any).certificateTemplate?.url) {
      certObj = (event as any).certificateTemplate;
    }

    let rankValue = "Participant";
    if (position === 1) rankValue = "Winner";
    else if (position === 2) rankValue = "Runner-up";
    else if (position === 3) rankValue = "Third Place";

    const certificateInfo = certObj ? {
      url: certObj.url,
      layout: certObj.layout,
      name: certObj.name || event.name,
      position,
      rankValue,
    } : null;



    if (!event.feedbackForm) {
      return NextResponse.json({
        submitted: true,
        form: null,
        certificate: certificateInfo,
        userName: session.user.name || "Student",
        position,
        rankValue,
        userId: session.user.id,
      });
    }

    const hasFeedback = await Feedback.exists({
      eventId: id,
      userId: session.user.id,
    });

    const form = await FeedbackForm.findById(event.feedbackForm).select("name questions").lean();

    return NextResponse.json({
      submitted: !!hasFeedback,
      form: hasFeedback ? null : form,
      certificate: certificateInfo,
      userName: session.user.name || "Student",
      userId: session.user.id,
    });
  } catch (error: any) {
    console.error("GET /api/events/[id]/feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { answers } = await req.json();

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }

    await connectToDb();

    const event = await Event.findById(id).select("feedbackForm").lean();
    if (!event || !event.feedbackForm) {
      return NextResponse.json({ error: "No feedback form required for this event" }, { status: 400 });
    }

    const hasFeedback = await Feedback.exists({
      eventId: id,
      userId: session.user.id,
    });

    if (hasFeedback) {
      return NextResponse.json({ error: "Feedback already submitted" }, { status: 400 });
    }

    // Validate answers format
    for (const ans of answers) {
      if (!ans.questionId || typeof ans.rating !== 'number' || ans.rating < 1 || ans.rating > 5) {
        return NextResponse.json({ error: "Invalid rating value for one or more questions" }, { status: 400 });
      }
    }

    await Feedback.create({
      eventId: id,
      userId: session.user.id,
      feedbackFormId: event.feedbackForm,
      answers,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/events/[id]/feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
