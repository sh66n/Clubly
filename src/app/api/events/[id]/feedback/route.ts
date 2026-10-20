import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Feedback, FeedbackForm } from "@/models";
import { isUserEventParticipant } from "@/services/getParticipants";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDb();

    const isClubAdmin = session.user.role === "club-admin" || session.user.role === "admin";
    const isParticipant = isClubAdmin || (await isUserEventParticipant(id, session.user.id));

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You must be a participant of this event to access feedback" },
        { status: 403 }
      );
    }

    const event: any = await Event.findById(id)
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

    const posCerts: any = event.certificatesByPosition;
    let targetCertId: any = null;

    if (position === 1 && posCerts?.first) {
      targetCertId = posCerts.first;
    } else if (position === 2 && posCerts?.second) {
      targetCertId = posCerts.second;
    } else if (position === 3 && posCerts?.third) {
      targetCertId = posCerts.third;
    } else {
      targetCertId = posCerts?.participation || event.certificate || posCerts?.first;
    }

    let certObj: any = null;
    const certIdStr = typeof targetCertId === "object" ? targetCertId?._id?.toString() : targetCertId?.toString();
    if (certIdStr) {
      const { Certificate } = await import("@/models");
      certObj = await Certificate.findById(certIdStr).lean();
    }
    if (!certObj && event.certificateTemplate?.url) {
      certObj = event.certificateTemplate;
    }

    let rankValue = "Participant";
    if (position === 1) rankValue = "Winner";
    else if (position === 2) rankValue = "Runner-up";
    else if (position === 3) rankValue = "Third Place";

    const isCertReady = Boolean(
      certObj &&
      certObj.url &&
      typeof certObj.url === "string" &&
      certObj.url.trim().length > 0
    );

    const certificateInfo = isCertReady ? {
      url: certObj.url,
      layout: certObj.layout,
      name: certObj.name || event.name,
      position,
      rankValue,
    } : null;

    const hasFeedback = await (Feedback as any).exists({
      eventId: new Types.ObjectId(id),
      userId: new Types.ObjectId(session.user.id),
    }).setOptions({ skipTenant: true });

    if (!event.feedbackForm) {
      return NextResponse.json({
        submitted: true,
        form: null,
        certificate: certificateInfo,
        hasCertificate: !!certificateInfo,
        eventName: event.name,
        userName: session.user.name || "Student",
        position,
        rankValue,
        userId: session.user.id,
      });
    }

    const form = await FeedbackForm.findById(event.feedbackForm).select("name questions").lean();

    return NextResponse.json({
      submitted: !!hasFeedback,
      form: hasFeedback ? null : form,
      certificate: certificateInfo,
      hasCertificate: !!certificateInfo,
      eventName: event.name,
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
    const { answers, comment } = await req.json();

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }

    await connectToDb();

    const isClubAdmin = session.user.role === "club-admin" || session.user.role === "admin";
    const isParticipant = isClubAdmin || (await isUserEventParticipant(id, session.user.id));

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Only participants of this event can submit feedback" },
        { status: 403 }
      );
    }

    const event: any = await Event.findById(id).select("feedbackForm tenantId").lean();
    if (!event || !event.feedbackForm) {
      return NextResponse.json({ error: "No feedback form required for this event" }, { status: 400 });
    }

    // Validate answers format
    for (const ans of answers) {
      if (!ans.questionId || typeof ans.rating !== 'number' || ans.rating < 1 || ans.rating > 5) {
        return NextResponse.json({ error: "Invalid rating value for one or more questions" }, { status: 400 });
      }
    }

    const hasFeedback = await (Feedback as any).exists({
      eventId: new Types.ObjectId(id),
      userId: new Types.ObjectId(session.user.id),
    }).setOptions({ skipTenant: true });

    if (hasFeedback) {
      return NextResponse.json({ error: "Feedback already submitted" }, { status: 400 });
    }

    const tenantId = event.tenantId || (session.user as any).tenantId;

    await Feedback.create({
      tenantId,
      eventId: id,
      userId: session.user.id,
      feedbackFormId: event.feedbackForm,
      answers,
      comment: typeof comment === "string" ? comment.trim() : undefined,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/events/[id]/feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
