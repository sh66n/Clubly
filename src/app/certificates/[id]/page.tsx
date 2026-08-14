import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { connectToDb } from "@/lib/connectToDb";
import { Event, User, Certificate, Registration, Group } from "@/models";
import { auth } from "@/auth";
import PublicCertificateViewer from "./PublicCertificateViewer";

interface CertificatePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ user?: string }>;
}

async function checkCertificateEligibility(event: any, user: any): Promise<boolean> {
  if (!user || !event) return false;
  const userIdStr = user._id.toString();

  // 1. Check if the user is a winner
  let isWinner = false;
  if (event.eventType === "individual") {
    const match = (event.winners || []).find(
      (w: any) => (w.user?._id || w.user)?.toString() === userIdStr
    );
    if (match || (event.winner?._id || event.winner)?.toString() === userIdStr) {
      isWinner = true;
    }
  } else {
    const group = await Group.findOne({
      event: event._id,
      members: user._id,
    }).select("_id");

    if (group?._id) {
      const groupIdStr = group._id.toString();
      const match = (event.winners || []).find(
        (w: any) => (w.group?._id || w.group)?.toString() === groupIdStr
      );
      if (match || (event.winnerGroup?._id || event.winnerGroup)?.toString() === groupIdStr) {
        isWinner = true;
      }
    }
  }

  if (isWinner) return true;

  // 2. Check if the user registered and attended the event
  const groupIds: any[] = [];
  if (event.eventType !== "individual") {
    const groups = await Group.find({ members: user._id }, { _id: 1 }).lean();
    groupIds.push(...groups.map((g) => g._id));
  }
  const regFilter =
    groupIds.length > 0
      ? {
          eventId: event._id,
          status: "attended",
          $or: [{ userId: user._id }, { groupId: { $in: groupIds } }],
        }
      : { eventId: event._id, status: "attended", userId: user._id };

  const hasAttended = await Registration.exists(regFilter);
  return !!hasAttended;
}

export async function generateMetadata({
  params,
  searchParams,
}: CertificatePageProps): Promise<Metadata> {
  const { id } = await params;
  const { user: userId } = await searchParams;

  await connectToDb();
  const event = await Event.findById(id)
    .populate("organizingClub", "name logo")
    .populate("certificate")
    .populate("certificatesByPosition.participation")
    .populate("certificatesByPosition.first")
    .populate("certificatesByPosition.second")
    .populate("certificatesByPosition.third")
    .lean();

  const user = userId ? await User.findById(userId).select("name").lean() : null;

  const isEligible = await checkCertificateEligibility(event, user);
  if (!isEligible) {
    return {
      title: "Certificate Verification | Clubly",
      description: "Verify event credentials on Clubly.",
    };
  }

  const eventName = event?.name || "Event";
  const recipientName = (user as any)?.name || "Recipient";
  const clubName = (event?.organizingClub as any)?.name || "Clubly";
  const clubLogo = (event?.organizingClub as any)?.logo;

  let position = 0;
  if (user && event) {
    const userIdStr = (user as any)._id.toString();
    if (event.eventType === "individual") {
      const match = (event.winners || []).find(
        (w: any) => (w.user?._id || w.user)?.toString() === userIdStr
      );
      if (match) position = match.position;
      else if ((event.winner?._id || event.winner)?.toString() === userIdStr) position = 1;
    } else {
      const group = await Group.findOne({
        event: event._id,
        members: (user as any)._id,
      }).select("_id");

      if (group?._id) {
        const groupIdStr = group._id.toString();
        const match = (event.winners || []).find(
          (w: any) => (w.group?._id || w.group)?.toString() === groupIdStr
        );
        if (match) position = match.position;
        else if ((event.winnerGroup?._id || event.winnerGroup)?.toString() === groupIdStr) position = 1;
      }
    }
  }

  const posCerts: any = event?.certificatesByPosition;
  let certObj: any = null;

  if (position === 1 && posCerts?.first) {
    certObj = posCerts.first;
  } else if (position === 2 && posCerts?.second) {
    certObj = posCerts.second;
  } else if (position === 3 && posCerts?.third) {
    certObj = posCerts.third;
  } else {
    certObj = posCerts?.participation || event?.certificate;
  }

  const imageUrl = certObj?.url || clubLogo || "/images/logo.svg";

  return {
    title: `Certificate of Achievement - ${recipientName} | ${eventName}`,
    description: `Verified certificate awarded to ${recipientName} for participating in ${eventName} organized by ${clubName} on Clubly.`,
    openGraph: {
      title: `${recipientName}'s Certificate for ${eventName}`,
      description: `Verified Certificate awarded by ${clubName} on Clubly.`,
      url: `https://clubly-vppcoe.vercel.app/certificates/${id}${userId ? `?user=${userId}` : ""}`,
      siteName: "Clubly",
      images: [
        {
          url: imageUrl,
          alt: `${recipientName}'s Certificate of Achievement`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Certificate of Achievement - ${recipientName}`,
      description: `Verified certificate awarded to ${recipientName} for ${eventName} on Clubly.`,
      images: [imageUrl],
    },
  };
}

export default async function CertificateVerificationPage({
  params,
  searchParams,
}: CertificatePageProps) {
  const { id: eventId } = await params;
  const { user: userId } = await searchParams;
  const session = await auth();

  await connectToDb();

  const event = await Event.findById(eventId)
    .populate("organizingClub", "name logo")
    .populate("certificate")
    .populate("certificatesByPosition.participation")
    .populate("certificatesByPosition.first")
    .populate("certificatesByPosition.second")
    .populate("certificatesByPosition.third")
    .lean();

  const hasCertificate = event && (
    event.providesCertificate ||
    event.certificate ||
    (event.certificatesByPosition as any)?.participation ||
    (event.certificatesByPosition as any)?.first
  );

  if (!event || !hasCertificate) {
    notFound();
  }

  let user = null;
  if (userId) {
    user = await User.findById(userId).select("name email year image").lean();
  }

  const isEligible = await checkCertificateEligibility(event, user);
  if (!isEligible) {
    notFound();
  }

  let position = 0;
  if (user) {
    const userIdStr = (user as any)._id.toString();
    if (event.eventType === "individual") {
      const match = (event.winners || []).find(
        (w: any) => (w.user?._id || w.user)?.toString() === userIdStr
      );
      if (match) position = match.position;
      else if ((event.winner?._id || event.winner)?.toString() === userIdStr) position = 1;
    } else {
      const group = await Group.findOne({
        event: event._id,
        members: (user as any)._id,
      }).select("_id");

      if (group?._id) {
        const groupIdStr = group._id.toString();
        const match = (event.winners || []).find(
          (w: any) => (w.group?._id || w.group)?.toString() === groupIdStr
        );
        if (match) position = match.position;
        else if ((event.winnerGroup?._id || event.winnerGroup)?.toString() === groupIdStr) position = 1;
      }
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

  if (!certObj || !certObj.url) {
    notFound();
  }

  const recipientName = (user as any)?.name || "Participant";
  const clubObj = event.organizingClub as { name?: string; logo?: string } | null;
  const clubName = clubObj?.name || "Club";
  const issueDate = event.startDate
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

  const eventDateObj = event.startDate ? new Date(event.startDate) : new Date();

  return (
    <main className="min-h-screen bg-[#0c0d12] text-white flex flex-col">
      <PublicCertificateViewer
        eventId={eventId}
        eventName={event.name || "Event"}
        recipientName={recipientName}
        recipientImage={(user as any)?.image}
        eventImage={event.image}
        registrationFee={event.registrationFee}
        clubName={clubName}
        clubLogo={clubObj?.logo}
        issueDate={issueDate}
        issueYear={eventDateObj.getFullYear()}
        issueMonth={eventDateObj.getMonth() + 1}
        rankValue={rankValue}
        certificateUrl={certObj.url}
        layout={certObj.layout}
        userId={userId || (user as any)?._id?.toString()}
        currentUserId={session?.user?.id}
      />
    </main>
  );
}
