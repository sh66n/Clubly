import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { connectToDb } from "@/lib/connectToDb";
import mongoose from "mongoose";
import { Event, User, Certificate, Registration, Group, Feedback, Club, CertificateFolder } from "@/models";
import { auth } from "@/auth";
import { runWithoutTenantFilter } from "@/lib/tenantPlugin";
import { getDefaultCertificateLayout } from "@/lib/certificate";
import { Award } from "lucide-react";
import PublicCertificateViewer from "./PublicCertificateViewer";

interface CertificatePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ user?: string }>;
}

async function resolveEventAndCertificate(id: string) {
  let event: any = null;
  let directCertificate: any = null;

  if (mongoose.Types.ObjectId.isValid(id)) {
    // 1. Try finding Event by ID
    event = await runWithoutTenantFilter(() =>
      Event.findById(id)
        .populate("organizingClub", "name logo")
        .populate("certificate")
        .populate("certificatesByPosition.participation")
        .populate("certificatesByPosition.first")
        .populate("certificatesByPosition.second")
        .populate("certificatesByPosition.third")
        .lean()
    );

    // 2. If not found, check if `id` is a Certificate ID
    if (!event) {
      directCertificate = await runWithoutTenantFilter(() =>
        Certificate.findById(id).lean()
      );

      if (directCertificate) {
        event = await runWithoutTenantFilter(() =>
          Event.findOne({
            $or: [
              { certificate: directCertificate._id },
              { "certificatesByPosition.participation": directCertificate._id },
              { "certificatesByPosition.first": directCertificate._id },
              { "certificatesByPosition.second": directCertificate._id },
              { "certificatesByPosition.third": directCertificate._id },
            ],
          })
            .populate("organizingClub", "name logo")
            .populate("certificate")
            .populate("certificatesByPosition.participation")
            .populate("certificatesByPosition.first")
            .populate("certificatesByPosition.second")
            .populate("certificatesByPosition.third")
            .lean()
        );

        if (!event && directCertificate.folder) {
          const folder: any = await runWithoutTenantFilter(() =>
            CertificateFolder.findById(directCertificate.folder).lean()
          );
          if (folder?.event) {
            event = await runWithoutTenantFilter(() =>
              Event.findById(folder.event)
                .populate("organizingClub", "name logo")
                .populate("certificate")
                .populate("certificatesByPosition.participation")
                .populate("certificatesByPosition.first")
                .populate("certificatesByPosition.second")
                .populate("certificatesByPosition.third")
                .lean()
            );
          }
        }
      }
    }
  }

  // 3. Try finding Event by slug if still not found
  if (!event && typeof id === "string") {
    event = await runWithoutTenantFilter(() =>
      Event.findOne({ slug: id })
        .populate("organizingClub", "name logo")
        .populate("certificate")
        .populate("certificatesByPosition.participation")
        .populate("certificatesByPosition.first")
        .populate("certificatesByPosition.second")
        .populate("certificatesByPosition.third")
        .lean()
    );
  }

  // 4. If direct certificate found but not tied to event, build standalone wrapper
  if (!event && directCertificate) {
    const club = directCertificate.club
      ? await runWithoutTenantFilter(() =>
          Club.findById(directCertificate.club).select("name logo").lean()
        )
      : null;
    event = {
      _id: directCertificate._id,
      name: directCertificate.name,
      organizingClub: club,
      providesCertificate: true,
      certificate: directCertificate,
      certificatesByPosition: { participation: directCertificate },
    };
  }

  return { event, directCertificate };
}

async function checkCertificateEligibility(
  event: any,
  user: any,
  sessionUser?: any
): Promise<boolean> {
  // If user is organizer or admin, always eligible to view/preview
  if (sessionUser) {
    const role = sessionUser.role;
    if (role === "platform-admin" || role === "super-admin") return true;
    if (
      role === "club-admin" &&
      sessionUser.adminClub &&
      (event.organizingClub?._id || event.organizingClub)?.toString() === sessionUser.adminClub?.toString()
    ) {
      return true;
    }
  }

  // If no user specified, allow public view of the certificate
  if (!user) return true;

  const userIdStr = user._id.toString();

  // 1. Check if winner
  let isWinner = false;
  if (event.eventType === "individual") {
    const match = (event.winners || []).find(
      (w: any) => (w.user?._id || w.user)?.toString() === userIdStr
    );
    if (match || (event.winner?._id || event.winner)?.toString() === userIdStr) {
      isWinner = true;
    }
  } else {
    const group = await runWithoutTenantFilter(() =>
      Group.findOne({
        event: event._id,
        members: user._id,
      }).select("_id")
    );

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

  // 2. Check if registered (registered or attended)
  const groupIds: any[] = [];
  if (event.eventType !== "individual") {
    const groups = await runWithoutTenantFilter(() =>
      Group.find({ members: user._id }, { _id: 1 }).lean()
    );
    groupIds.push(...groups.map((g) => g._id));
  }

  const regFilter: any =
    groupIds.length > 0
      ? {
          eventId: event._id,
          $or: [{ userId: user._id }, { groupId: { $in: groupIds } }],
        }
      : { eventId: event._id, userId: user._id };

  const hasRegistered = await runWithoutTenantFilter(() =>
    Registration.exists(regFilter)
  );

  return !!hasRegistered;
}

export async function generateMetadata({
  params,
  searchParams,
}: CertificatePageProps): Promise<Metadata> {
  const { id } = await params;
  const { user: userIdQuery } = await searchParams;

  await connectToDb();
  const { event, directCertificate } = await resolveEventAndCertificate(id);

  if (!event && !directCertificate) {
    return {
      title: "Certificate Verification | Clubly",
      description: "Verify event credentials on Clubly.",
    };
  }

  const session = await auth();
  const activeUserId = userIdQuery || session?.user?.id;
  const user = activeUserId && mongoose.Types.ObjectId.isValid(activeUserId)
    ? await runWithoutTenantFilter(() => User.findById(activeUserId).select("name").lean())
    : null;

  const eventName = event?.name || directCertificate?.name || "Event";
  const recipientName = (user as any)?.name || "Participant";
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
      const group = await runWithoutTenantFilter(() =>
        Group.findOne({
          event: event._id,
          members: (user as any)._id,
        }).select("_id")
      );

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
    certObj = posCerts?.participation || event?.certificate || directCertificate;
  }

  const imageUrl = certObj?.url || clubLogo || "/images/logo.png";

  return {
    title: `Certificate of Achievement - ${recipientName} | ${eventName}`,
    description: `Verified certificate awarded to ${recipientName} for participating in ${eventName} organized by ${clubName} on Clubly.`,
    openGraph: {
      title: `${recipientName}'s Certificate for ${eventName}`,
      description: `Verified Certificate awarded by ${clubName} on Clubly.`,
      url: `https://clubly.tech/certificates/${id}${activeUserId ? `?user=${activeUserId}` : ""}`,
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
  const { id } = await params;
  const { user: userIdQuery } = await searchParams;
  const session = await auth();

  await connectToDb();

  // 1. Resolve User (query parameter or session)
  const activeUserId = userIdQuery || session?.user?.id;
  let user: any = null;
  if (activeUserId && mongoose.Types.ObjectId.isValid(activeUserId)) {
    user = await runWithoutTenantFilter(() =>
      User.findById(activeUserId).select("name email year image").lean()
    );
  }

  // 2. Resolve Event and Certificate
  const { event, directCertificate } = await resolveEventAndCertificate(id);

  if (!event) {
    notFound();
  }

  const hasCertificate = Boolean(
    event.providesCertificate ||
    event.certificate ||
    (event.certificatesByPosition as any)?.participation ||
    (event.certificatesByPosition as any)?.first ||
    directCertificate
  );

  if (!hasCertificate) {
    notFound();
  }

  // 3. Feedback check (redirect to feedback form instead of 404)
  if (event.feedbackForm && user) {
    const hasFeedback = await runWithoutTenantFilter(() =>
      Feedback.exists({
        eventId: event._id,
        userId: user._id,
      })
    );
    const isAdmin =
      session?.user?.role === "platform-admin" ||
      session?.user?.role === "super-admin" ||
      (session?.user?.role === "club-admin" &&
        session?.user?.adminClub?.toString() ===
          (event.organizingClub?._id || event.organizingClub)?.toString());

    if (!hasFeedback && !isAdmin) {
      redirect(`/events/${event.slug || event._id}/feedback`);
    }
  }

  // 4. Eligibility check
  const isEligible = await checkCertificateEligibility(event, user, session?.user);
  if (!isEligible) {
    return (
      <main className="min-h-screen bg-[#0c0d12] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col items-center">
          <Award className="w-16 h-16 text-amber-400 mb-4 opacity-80" />
          <h1 className="text-xl font-bold text-white mb-2">Certificate Not Found</h1>
          <p className="text-sm text-zinc-400 mb-6">
            We couldn't verify a certificate for this participant for{" "}
            <span className="text-white font-medium">{event.name}</span>. Only registered participants and winners are eligible to receive certificates.
          </p>
          <Link
            href={`/events/${event.slug || event._id}`}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors"
          >
            View Event Details
          </Link>
        </div>
      </main>
    );
  }

  // 5. Determine position / rank
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
      const group = await runWithoutTenantFilter(() =>
        Group.findOne({
          event: event._id,
          members: (user as any)._id,
        }).select("_id")
      );

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
    certObj = posCerts?.participation || event.certificate || directCertificate;
  }

  // If certObj is just an ID (not populated), fetch it
  if (certObj && (mongoose.Types.ObjectId.isValid(certObj) || typeof certObj === "string")) {
    certObj = await runWithoutTenantFilter(() => Certificate.findById(certObj).lean());
  }

  const clubObj = event.organizingClub as { name?: string; logo?: string } | null;
  const clubName = clubObj?.name || "Club";

  // If certificate has not uploaded template image yet
  if (!certObj || !certObj.url) {
    return (
      <main className="min-h-screen bg-[#0c0d12] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col items-center">
          <Award className="w-16 h-16 text-emerald-400 mb-4 opacity-80" />
          <h1 className="text-xl font-bold text-white mb-2">{event.name || "Event"} Certificate</h1>
          <p className="text-sm text-zinc-400 mb-6">
            The certificate template for this event is currently being finalized by{" "}
            <span className="text-white font-medium">{clubName}</span>. Please check back shortly!
          </p>
          <Link
            href={`/events/${event.slug || event._id}`}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors"
          >
            Back to Event
          </Link>
        </div>
      </main>
    );
  }

  const recipientName = (user as any)?.name || "Participant";
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
        eventId={event._id?.toString() || id}
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
        layout={certObj.layout || getDefaultCertificateLayout()}
        userId={userIdQuery || (user as any)?._id?.toString()}
        currentUserId={session?.user?.id}
      />
    </main>
  );
}
