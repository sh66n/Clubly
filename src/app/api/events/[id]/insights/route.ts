import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Payment, Registration } from "@/models";
import { NextResponse } from "next/server";

type AnswerValue = string | string[];

const toPct = (num: number, den: number) =>
  den > 0 ? Number(((num / den) * 100).toFixed(1)) : 0;

const toRupees = (paise: number) => Number((paise / 100).toFixed(2));

const getRegistrantKey = (registration: any) => {
  if (registration.userId?._id) {
    return `user:${registration.userId._id.toString()}`;
  }
  if (registration.groupId?._id) {
    return `group:${registration.groupId._id.toString()}`;
  }
  return "";
};

const getPaymentKey = (payment: any) => {
  if (payment.userId) {
    return `user:${payment.userId.toString()}`;
  }
  if (payment.groupId) {
    return `group:${payment.groupId.toString()}`;
  }
  return "";
};

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDb();
    const { id } = await params;

    const event = await Event.findById(id)
      .populate("organizingClub", "name")
      .populate("winner", "name email image")
      .populate({
        path: "winnerGroup",
        select: "name members leader",
        populate: [
          { path: "members", select: "name email image" },
          { path: "leader", select: "name email image" },
        ],
      });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (
      event.organizingClub?._id?.toString() !==
      session.user.adminClub?.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const registrations = await Registration.find({ eventId: id })
      .populate("userId", "name email image")
      .populate({
        path: "groupId",
        select: "name members leader",
        populate: [
          { path: "members", select: "name email image" },
          { path: "leader", select: "name email image" },
        ],
      });

    const payments = await Payment.find({ eventId: id })
      .sort({ createdAt: -1 })
      .select("userId groupId amount status createdAt");

    const isTeamEvent = event.eventType === "team";
    const primaryEntityLabel = isTeamEvent ? "team" : "participant";
    const primaryEntityLabelPlural = isTeamEvent ? "teams" : "participants";

    const totalRegistrations = registrations.length;
    const attendedCount = registrations.filter(
      (registration) => registration.status === "attended",
    ).length;
    const absentCount = registrations.filter(
      (registration) => registration.status === "absent",
    ).length;
    const registeredOnlyCount = registrations.filter(
      (registration) => registration.status === "registered",
    ).length;

    const attendanceRate = toPct(attendedCount, totalRegistrations);
    const noShowRate = toPct(absentCount, totalRegistrations);

    const totalPeopleRepresented = isTeamEvent
      ? registrations.reduce(
          (sum, registration) =>
            sum + Number(registration.groupId?.members?.length ?? 0),
          0,
        )
      : totalRegistrations;
    const attendedPeopleRepresented = isTeamEvent
      ? registrations
          .filter((registration) => registration.status === "attended")
          .reduce(
            (sum, registration) =>
              sum + Number(registration.groupId?.members?.length ?? 0),
            0,
          )
      : attendedCount;
    const absentPeopleRepresented = isTeamEvent
      ? registrations
          .filter((registration) => registration.status === "absent")
          .reduce(
            (sum, registration) =>
              sum + Number(registration.groupId?.members?.length ?? 0),
            0,
          )
      : absentCount;

    const maxRegistrations = Number(event.maxRegistrations ?? 0);
    const capacityUtilization =
      maxRegistrations > 0 ? toPct(totalRegistrations, maxRegistrations) : 0;

    const paidCount = payments.filter(
      (payment) => payment.status === "paid",
    ).length;
    const failedCount = payments.filter(
      (payment) => payment.status === "failed",
    ).length;
    const createdCount = payments.filter(
      (payment) => payment.status === "created",
    ).length;
    const revenuePaise = payments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const avgRevenuePerAttendeePaise =
      attendedCount > 0 ? Math.round(revenuePaise / attendedCount) : 0;
    const avgRevenuePerAttendingPersonPaise =
      attendedPeopleRepresented > 0
        ? Math.round(revenuePaise / attendedPeopleRepresented)
        : 0;

    const paymentStatusByRegistrant = new Map<string, string>();
    for (const payment of payments) {
      const key = getPaymentKey(payment);
      if (!key || paymentStatusByRegistrant.has(key)) continue;
      paymentStatusByRegistrant.set(key, payment.status);
    }

    const toListItem = (registration: any) => {
      if (registration.userId?._id) {
        const key = getRegistrantKey(registration);
        return {
          id: registration.userId._id.toString(),
          type: "user",
          name: registration.userId.name,
          email: registration.userId.email,
          image: registration.userId.image,
          status: registration.status,
          paymentStatus: paymentStatusByRegistrant.get(key) ?? "not-required",
        };
      }

      if (registration.groupId?._id) {
        const key = getRegistrantKey(registration);
        return {
          id: registration.groupId._id.toString(),
          type: "group",
          name: registration.groupId.name,
          image: registration.groupId.leader?.image ?? "",
          leaderName: registration.groupId.leader?.name,
          memberCount: registration.groupId.members?.length ?? 0,
          status: registration.status,
          paymentStatus: paymentStatusByRegistrant.get(key) ?? "not-required",
        };
      }

      return null;
    };

    const listItems = registrations
      .map(toListItem)
      .filter(Boolean)
      .filter((item: any) =>
        isTeamEvent ? item.type === "group" : item.type === "user",
      );

    const registeredList = listItems.filter(
      (item: any) => item.status === "registered",
    );
    const attendedList = listItems.filter(
      (item: any) => item.status === "attended",
    );
    const absentList = listItems.filter(
      (item: any) => item.status === "absent",
    );

    const questionMeta = new Map<
      string,
      {
        question: string;
        type: "text" | "select" | "multiselect";
      }
    >();

    for (const question of event.customQuestions ?? []) {
      questionMeta.set(question.id, {
        question: question.question,
        type: question.type,
      });
    }

    const countsByQuestion = new Map<string, Map<string, number>>();
    const textCountsByQuestion = new Map<string, number>();
    const responseCountByQuestion = new Map<string, number>();

    const answerSources = registrations.flatMap(
      (registration) => registration.customQuestionAnswers ?? [],
    );

    for (const answer of answerSources) {
      const questionId = answer.questionId;
      const meta = questionMeta.get(questionId);
      const type = meta?.type ?? "text";

      responseCountByQuestion.set(
        questionId,
        (responseCountByQuestion.get(questionId) ?? 0) + 1,
      );

      if (type === "text") {
        textCountsByQuestion.set(
          questionId,
          (textCountsByQuestion.get(questionId) ?? 0) + 1,
        );
        continue;
      }

      const bucket =
        countsByQuestion.get(questionId) ?? new Map<string, number>();

      const value = answer.answer as AnswerValue;
      const answerValues = Array.isArray(value) ? value : [value];

      for (const rawValue of answerValues) {
        const normalized = String(rawValue || "").trim() || "No response";
        bucket.set(normalized, (bucket.get(normalized) ?? 0) + 1);
      }

      countsByQuestion.set(questionId, bucket);
    }

    const questionInsights = (event.customQuestions ?? []).map((question) => {
      const totalResponses = responseCountByQuestion.get(question.id) ?? 0;
      const answerCounts = countsByQuestion.get(question.id) ?? new Map();
      const topAnswers = [...answerCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([answer, count]) => ({
          answer,
          count,
          percentage: toPct(count, totalResponses),
        }));

      return {
        questionId: question.id,
        question: question.question,
        type: question.type,
        totalResponses,
        textResponses: textCountsByQuestion.get(question.id) ?? 0,
        topAnswers,
      };
    });

    const funnel = [
      {
        label: `${primaryEntityLabelPlural} registered`,
        value: totalRegistrations,
        ratioFromPrevious: 100,
        dropFromPrevious: 0,
      },
      {
        label: `${primaryEntityLabelPlural} paid`,
        value: paidCount,
        ratioFromPrevious: toPct(paidCount, totalRegistrations),
        dropFromPrevious: Math.max(totalRegistrations - paidCount, 0),
      },
      {
        label: `${primaryEntityLabelPlural} attended`,
        value: attendedCount,
        ratioFromPrevious: toPct(
          attendedCount,
          paidCount || totalRegistrations,
        ),
        dropFromPrevious: Math.max(paidCount - attendedCount, 0),
      },
    ];

    const eventResponse = {
      _id: event._id,
      name: event.name,
      eventType: event.eventType,
      date: event.date,
      maxRegistrations: event.maxRegistrations,
      registrationFee: event.registrationFee,
      isRegistrationOpen: event.isRegistrationOpen,
      organizingClub: event.organizingClub,
      winner: event.winner,
      winnerGroup: event.winnerGroup,
    };

    return NextResponse.json(
      {
        event: eventResponse,
        metrics: {
          isTeamEvent,
          primaryEntityLabel,
          primaryEntityLabelPlural,
          totalRegistrations,
          attendedCount,
          absentCount,
          registeredOnlyCount,
          attendanceRate,
          noShowRate,
          totalPeopleRepresented,
          attendedPeopleRepresented,
          absentPeopleRepresented,
          capacityUtilization,
          paidCount,
          failedCount,
          createdCount,
          revenuePaise,
          revenue: toRupees(revenuePaise),
          avgRevenuePerAttendeePaise,
          avgRevenuePerAttendee: toRupees(avgRevenuePerAttendeePaise),
          avgRevenuePerAttendingPersonPaise,
          avgRevenuePerAttendingPerson: toRupees(
            avgRevenuePerAttendingPersonPaise,
          ),
        },
        funnel,
        questionInsights,
        lists: {
          registered: registeredList,
          attended: attendedList,
          absent: absentList,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
