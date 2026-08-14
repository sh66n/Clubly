import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, FeedbackForm, Feedback } from "@/models";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDb();
    const { id } = await params;
    const form = await FeedbackForm.findOne({ _id: id, club: session.user.adminClub });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const linkedEvents = await Event.find({ feedbackForm: id }).select("name date").lean();

    return NextResponse.json({ form, linkedEvents });
  } catch (error: any) {
    console.error("GET /api/club-admin/feedback-forms/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, questions } = await req.json();

    if (!name || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Invalid data. Name and at least one question are required." },
        { status: 400 }
      );
    }

    await connectToDb();
    
    // Check if the form is already being used in feedbacks
    const hasFeedbacks = await Feedback.exists({ feedbackFormId: id });
    if (hasFeedbacks) {
      return NextResponse.json(
        { error: "Cannot modify form because it already has submissions." },
        { status: 400 }
      );
    }

    const formattedQuestions = questions.map((q: any) => ({
      id: q.id || uuidv4(),
      text: q.text,
      required: q.required ?? true,
    }));

    const form = await FeedbackForm.findOneAndUpdate(
      { _id: id, club: session.user.adminClub },
      { name, questions: formattedQuestions },
      { new: true }
    );

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ form });
  } catch (error: any) {
    console.error("PATCH /api/club-admin/feedback-forms/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectToDb();
    
    // Check if the form is linked to any events
    const hasEvents = await Event.exists({ feedbackForm: id });
    if (hasEvents) {
      return NextResponse.json(
        { error: "Cannot delete form because it is linked to one or more events." },
        { status: 400 }
      );
    }
    
    // Check if the form has submissions
    const hasFeedbacks = await Feedback.exists({ feedbackFormId: id });
    if (hasFeedbacks) {
      return NextResponse.json(
        { error: "Cannot delete form because it has submissions." },
        { status: 400 }
      );
    }

    const form = await FeedbackForm.findOneAndDelete({ _id: id, club: session.user.adminClub });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/club-admin/feedback-forms/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
