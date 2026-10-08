import React from "react";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Feedback, FeedbackForm, Group } from "@/models";
import EventFeedbackFormClient from "@/components/Events/EventFeedbackFormClient";

export default async function EventFeedbackPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  const { eventId } = await params;

  if (!session?.user) {
    redirect(`/login?callbackUrl=/events/${eventId}/feedback`);
  }

  await connectToDb();

  const eventDoc = await Event.findById(eventId)
    .populate("organizingClub", "name logo")
    .lean();

  if (!eventDoc) {
    notFound();
  }

  const event = JSON.parse(JSON.stringify(eventDoc));

  // Check if feedback is already submitted
  const feedbackDoc = await Feedback.exists({
    eventId,
    userId: session.user.id,
  });
  const hasFeedback = Boolean(feedbackDoc);

  // Check if a certificate is configured for this attendee
  let position = 0;
  const userIdStr = session.user.id.toString();

  if (event.eventType === "individual") {
    const match = (event.winners || []).find(
      (w: any) => (w.user?._id || w.user)?.toString() === userIdStr,
    );
    if (match) position = match.position;
    else if ((event.winner?._id || event.winner)?.toString() === userIdStr) position = 1;
  } else {
    const group = await Group.findOne({
      event: event._id,
      members: session.user.id,
    }).select("_id");

    if (group) {
      const groupIdStr = group._id.toString();
      const match = (event.winners || []).find(
        (w: any) => (w.group?._id || w.group)?.toString() === groupIdStr,
      );
      if (match) position = match.position;
      else if ((event.winnerGroup?._id || event.winnerGroup)?.toString() === groupIdStr) position = 1;
    }
  }

  const posCerts: any = event.certificatesByPosition;
  let targetCertId: any = null;
  if (position === 1 && posCerts?.first) targetCertId = posCerts.first;
  else if (position === 2 && posCerts?.second) targetCertId = posCerts.second;
  else if (position === 3 && posCerts?.third) targetCertId = posCerts.third;
  else targetCertId = posCerts?.participation || event.certificate || posCerts?.first;

  const hasCertificate = Boolean(
    targetCertId || event.certificateTemplate?.url,
  );

  let form = null;
  if (event.feedbackForm) {
    const formDoc = await FeedbackForm.findById(event.feedbackForm).lean();
    if (formDoc) {
      form = JSON.parse(JSON.stringify(formDoc));
    }
  }

  return (
    <EventFeedbackFormClient
      eventId={eventId}
      eventName={event.name}
      eventDate={event.date}
      organizingClubName={event.organizingClub?.name}
      organizingClubLogo={event.organizingClub?.logo}
      form={form}
      hasFeedback={hasFeedback}
      hasCertificate={hasCertificate}
    />
  );
}
