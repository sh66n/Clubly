import { connectToDb } from "@/lib/connectToDb";
import { Event, Group, Registration, Certificate } from "@/models";
import { Types } from "mongoose";

export interface UserCertificateItem {
  eventId: string;
  eventName: string;
  clubName: string;
  clubLogo?: string;
  issueDate: string;
  position: number;
  rankValue: string;
  certificateUrl: string;
  layout: any;
  publicUrl: string;
  downloadUrl: string;
}

export async function getUserCertificates(userId: string): Promise<UserCertificateItem[]> {
  if (!Types.ObjectId.isValid(userId)) return [];

  await connectToDb();
  const userObjectId = new Types.ObjectId(userId);

  const groups = await Group.find({ members: userObjectId }, { _id: 1 }).lean();
  const groupIds = groups.map((g) => g._id);

  const regFilter =
    groupIds.length > 0
      ? { $or: [{ userId: userObjectId }, { groupId: { $in: groupIds } }] }
      : { userId: userObjectId };

  const registrations = await Registration.find(regFilter).select("eventId").lean();
  const eventIds = [...new Set(registrations.map((r) => r.eventId?.toString()).filter(Boolean))];

  if (eventIds.length === 0) return [];

  const events = await Event.find({
    _id: { $in: eventIds },
    providesCertificate: true,
  })
    .populate("organizingClub", "name logo")
    .populate("certificate")
    .populate("certificatesByPosition.participation")
    .populate("certificatesByPosition.first")
    .populate("certificatesByPosition.second")
    .populate("certificatesByPosition.third")
    .lean();

  const { Feedback } = await import("@/models");
  const certificatesList: UserCertificateItem[] = [];
  const userIdStr = userId.toString();

  for (const event of events) {
    if (event.feedbackForm) {
      const hasFeedback = await Feedback.exists({
        eventId: event._id,
        userId: userObjectId,
      });
      if (!hasFeedback) continue;
    }

    let position = 0;

    if (event.eventType === "individual") {
      const match = (event.winners || []).find(
        (w: any) => (w.user?._id || w.user)?.toString() === userIdStr
      );
      if (match) position = match.position;
      else if ((event.winner?._id || event.winner)?.toString() === userIdStr) position = 1;
    } else if (groupIds.length > 0) {
      const match = (event.winners || []).find((w: any) =>
        groupIds.some((gid) => gid.toString() === (w.group?._id || w.group)?.toString())
      );
      if (match) position = match.position;
      else if (
        groupIds.some(
          (gid) => gid.toString() === (event.winnerGroup?._id || event.winnerGroup)?.toString()
        )
      ) {
        position = 1;
      }
    }

    let rankValue = "Participant";
    if (position === 1) rankValue = "Winner";
    else if (position === 2) rankValue = "Runner-up";
    else if (position === 3) rankValue = "Third Place";

    const posCerts: any = event.certificatesByPosition;
    let certObj: any = null;

    if (position === 1 && posCerts?.first) {
      certObj = posCerts.first;
    } else if (position === 2 && posCerts?.second) {
      certObj = posCerts.second;
    } else if (position === 3 && posCerts?.third) {
      certObj = posCerts.third;
    } else {
      certObj = posCerts?.participation || event.certificate;
    }

    if (!certObj || !certObj.url) continue;

    const club = event.organizingClub as { name?: string; logo?: string } | null;
    const eventDate = event.startDate
      ? new Date(event.startDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    certificatesList.push({
      eventId: event._id.toString(),
      eventName: event.name || "Event",
      clubName: club?.name || "Club",
      clubLogo: club?.logo,
      issueDate: eventDate,
      position,
      rankValue,
      certificateUrl: certObj.url,
      layout: certObj.layout,
      publicUrl: `/certificates/${event._id.toString()}?user=${userIdStr}`,
      downloadUrl: `/api/events/${event._id.toString()}/certificate`,
    });
  }

  return certificatesList;
}
