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
      .populate("certificate")
      .lean();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    let certObj: any = (event as any).certificate;
    const posCerts: any = (event as any).certificatesByPosition;
    let certId = posCerts?.participation || certObj?._id;

    let position = 0;
    if (event.eventType === "individual") {
      const match = (event.winners || []).find((w: any) => w.user?.toString() === session.user.id.toString());
      if (match) position = match.position;
      else if (event.winner?.toString() === session.user.id.toString()) position = 1;
    }

    if (position === 1 && posCerts?.first) certId = posCerts.first;
    else if (position === 2 && posCerts?.second) certId = posCerts.second;
    else if (position === 3 && posCerts?.third) certId = posCerts.third;

    if (certId && certId.toString() !== certObj?._id?.toString()) {
      const { Certificate } = await import("@/models");
      certObj = await Certificate.findById(certId).lean();
    }
    if (!certObj && (event as any).certificateTemplate?.url) {
      certObj = (event as any).certificateTemplate;
    }

    const certificateInfo = certObj ? {
      url: certObj.url,
      layout: certObj.layout,
      name: certObj.name || event.name,
    } : null;

    if (!event.feedbackForm) {
      return NextResponse.json({ submitted: true, form: null, certificate: certificateInfo });
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
