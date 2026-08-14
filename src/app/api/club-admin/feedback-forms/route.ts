import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { FeedbackForm } from "@/models";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDb();
    const forms = await FeedbackForm.find({ club: session.user.adminClub }).sort({ createdAt: -1 });

    return NextResponse.json({ forms });
  } catch (error: any) {
    console.error("GET /api/club-admin/feedback-forms error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, questions } = await req.json();

    if (!name || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Invalid data. Name and at least one question are required." },
        { status: 400 }
      );
    }

    const formattedQuestions = questions.map((q: any) => ({
      id: uuidv4(),
      text: q.text,
      required: q.required ?? true,
    }));

    await connectToDb();
    
    const form = await FeedbackForm.create({
      club: session.user.adminClub,
      name,
      questions: formattedQuestions,
    });

    return NextResponse.json({ form }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/club-admin/feedback-forms error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
