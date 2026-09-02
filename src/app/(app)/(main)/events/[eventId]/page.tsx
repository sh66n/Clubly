import { auth } from "@/auth";
import BorderedDiv from "@/components/BorderedDiv";
import EventDetails from "@/components/Events/EventDetails";
import { ArrowRight, ChartNoAxesColumn } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group, Registration, User } from "@/models";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  const { eventId } = await params;

  if (!session?.user) {
    redirect(`/login?callbackUrl=/events/${eventId}`);
  }

  await connectToDb();

  const eventDoc = await Event.findById(eventId)
    .populate("contact")
    .populate("organizingClub")
    .populate("collaboratingClubs")
    .populate("certificate")
    .populate("winner")
    .populate({
      path: "winnerGroup",
      populate: [
        { path: "members", select: "name email image" },
        { path: "leader", select: "name email image" },
      ],
    })
    .lean();

  if (!eventDoc) {
    notFound();
  }

  let myGroup = null;
  if (eventDoc.eventType === "team" && session?.user?.id) {
    const groupDoc = await Group.findOne({
      event: eventDoc._id,
      members: session.user.id,
    })
      .populate("members", "name email image phoneNumber department year")
      .populate("leader", "name email image phoneNumber department year")
      .lean();

    if (groupDoc) {
      myGroup = JSON.parse(JSON.stringify(groupDoc));
    }
  }

  let alreadyRegistered = false;
  if (eventDoc.eventType === "team") {
    if (myGroup) {
      const groupReg = await Registration.exists({
        eventId,
        groupId: myGroup._id,
      });
      alreadyRegistered = !!groupReg;
    }
  } else {
    const userReg = await Registration.exists({
      eventId,
      userId: session.user.id,
    });
    alreadyRegistered = !!userReg;
  }

  let registrationCount = 0;
  if (eventDoc.eventType === "team") {
    registrationCount = await Registration.countDocuments({
      eventId,
      groupId: { $exists: true },
    });
  } else {
    registrationCount = await Registration.countDocuments({
      eventId,
      userId: { $exists: true },
    });
  }

  let dbUser = null;
  if (session?.user?.id) {
    const userDoc = await User.findById(session.user.id).select("-password").lean();
    if (userDoc) {
      dbUser = JSON.parse(JSON.stringify(userDoc));
      dbUser.id = dbUser._id;
    }
  }

  const rawEvent = JSON.parse(JSON.stringify(eventDoc));
  const event = {
    ...rawEvent,
    alreadyRegistered,
    registrationCount,
  };

  const user = dbUser || session?.user;

  return (
    <>
      <div className="h-full">
        <EventDetails event={event} group={myGroup} user={user} />
        {session?.user.role === "club-admin" &&
          session?.user.adminClub?.toString() ===
            (event.organizingClub?._id || event.organizingClub)?.toString() && (
            <div className="mt-4">
              <h2 className="text-xl mb-2">Event Insights</h2>
              <BorderedDiv className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm text-[#8D8D8D]">
                    Open the dedicated analytics view for attendance,
                    conversion, payments, and registration behavior.
                  </p>
                </div>
                <Link
                  href={`/events/${event._id.toString()}/insights`}
                  className="inline-flex items-center gap-2 bg-[#5E77F5] text-white px-4 py-2 rounded-lg hover:opacity-90 w-fit"
                >
                  <ChartNoAxesColumn size={16} />
                  Open Insights
                  <ArrowRight size={16} />
                </Link>
              </BorderedDiv>
            </div>
          )}
      </div>
    </>
  );
}
