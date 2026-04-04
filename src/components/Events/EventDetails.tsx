"use client";

import React, { useState } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { IEvent } from "@/models/event.schema";
import {
  ArrowRight,
  Award,
  Building,
  Calendar,
  ChevronRight,
  FileBadge,
  MessageCircle,
  Pencil,
  Trophy,
  User,
  Users,
} from "lucide-react";
import BorderedDiv from "../BorderedDiv";
import Link from "next/link";
import GroupCard from "../Groups/GroupCard";
import { useRouter } from "next/navigation";
import { IUser } from "@/models/user.schema";
import { toast } from "sonner";
import Payment from "../Payment/Payment";
import BackButton from "../BackButton";
import CopyCodeButton from "../Groups/CopyCodeButton";
import ContinueWithGroupModal from "../Groups/ContinueWithGroupModal";
import RegistrationQuestionsModal from "./RegistrationQuestionsModal";
import DownloadCertificateButton from "./DownloadCertificateButton";

interface EventDetailsProps {
  event: IEvent;
  group: any;
  user: IUser;
}

type RegistrationStatus = "idle" | "processing" | "registered";
type CustomQuestionAnswer = {
  questionId: string;
  answer: string | string[];
};

export default function EventDetails({
  event,
  group,
  user,
}: EventDetailsProps) {
  const today = new Date();
  const eventDate = new Date(event.date);
  const daysLeft = Math.max(differenceInCalendarDays(eventDate, today), 0);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [registrationStatus, setRegistrationStatus] =
    useState<RegistrationStatus>("idle");
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [hasSubmittedQuestions, setHasSubmittedQuestions] = useState(false);
  const [paymentAutoStartTrigger, setPaymentAutoStartTrigger] = useState(0);
  const [pendingAnswers, setPendingAnswers] = useState<CustomQuestionAnswer[]>(
    [],
  );

  const handleRegister = async (
    customQuestionAnswers: CustomQuestionAnswer[] = [],
  ) => {
    try {
      setRegistrationStatus("processing");

      if (!user) {
        router.push("/login");
        return;
      }

      const payload: any = { eventId: event._id };

      if (event.eventType === "individual") {
        payload.userId = user.id;
      } else {
        if (!group) {
          toast.error("You must join or create a group first.");
          setRegistrationStatus("idle");
          return;
        }
        payload.groupId = group._id;
      }
      payload.customQuestionAnswers = customQuestionAnswers;

      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error);

      toast.success("Registered successfully");
      setRegistrationStatus("registered");

      router.replace(`/events/${event._id}/success`);
    } catch (err: any) {
      toast.error(err.message);
      setRegistrationStatus("idle");
    }
  };

  const isAlreadyRegistered = Boolean((event as any).alreadyRegistered);

  //  Check if event has passed
  const hasEventPassed = differenceInCalendarDays(today, eventDate) > 0;

  const registrationsFull =
    Number((event as any).registrationCount ?? 0) >= event.maxRegistrations;

  //  Disable register logic
  const isRegisterDisabled =
    registrationStatus !== "idle" ||
    isAlreadyRegistered ||
    hasEventPassed ||
    isLoading ||
    registrationsFull ||
    event.isRegistrationOpen === false ||
    (event.eventType === "team" &&
      (!group || // No group
        user.id !== group.leader._id || // Not leader
        group.members.length <
          (event.teamSize ? event.teamSize : (event.teamSizeRange?.min ?? 1)))); // Team too small

  const getCTA = () => {
    //handle processing
    if (registrationStatus === "processing") return "Processing";

    //handle already registered
    if (isAlreadyRegistered) {
      return "Registered";
    }

    //handle registrations full
    if (registrationsFull) {
      return "Registrations are full";
    }

    //handle event passing
    if (hasEventPassed) {
      return "Registrations closed";
    }

    //handle explicitly closed registrations
    if (event.isRegistrationOpen === false) {
      return "Registrations closed";
    }

    //handle solo events
    if (event.eventType !== "team") {
      if (registrationStatus === "registered") return "Registered";

      if (event.registrationFee) return "Pay now";
      else return "Register";
    }

    //handle group events
    if (!group) {
      return "Create or join a group to continue";
    }

    const required = event.teamSize
      ? event.teamSize
      : (event?.teamSizeRange?.min ?? 1);
    const current = group.members.length;

    if (current < required) {
      return "Complete group to proceeed";
    }

    if (user.id !== group.leader._id) {
      return "Only group leader can register";
    }

    //finally if everything is good let the user register
    if (event.registrationFee) return "Pay now";
    else return "Register";
  };

  const ctaText = getCTA();

  const hasRewards = event.prize || event.providesCertificate;
  const hasCustomQuestions = Boolean(event.customQuestions?.length);
  const openRegistrationFlow = () => {
    if (hasCustomQuestions) {
      setIsQuestionsModalOpen(true);
      return;
    }
    handleRegister();
  };

  return (
    <>
      <BackButton link={"/events"} />
      <div className="xl:flex relative">
        <div className="xl:w-[70%]">
          {/* Event Header */}
          <div className="relative w-full h-64 md:h-[26rem] overflow-hidden mb-8 rounded-lg">
            {/* Image */}
            <img
              src={event.image || "/images/default-banner.png"}
              className="w-full h-full object-cover scale-[1.04] hover:scale-100 duration-[8000ms] grayscale-[0.2] brightness-90 hover:grayscale-0 hover:brightness-95 transition-all"
              alt={event.name}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

            {/* Prize badge — top right */}
            {event.prize && event.prize > 0 && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                <Trophy size={13} className="text-yellow-500" />
                <span className="text-xs font-semibold tracking-[0.14em] text-yellow-400">
                  ₹{event.prize}
                </span>
              </div>
            )}

            {/* Bottom content */}
            <div className="absolute inset-0 flex flex-col justify-end gap-3 p-5 md:p-8">
              {/* Live dot + event type */}
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                  {event.eventType === "team" ? "Team Event" : "Solo Event"}
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-3xl md:text-5xl font-black uppercase leading-[0.9] tracking-tight text-white drop-shadow-2xl"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {event.name}
              </h1>

              {/* Club row */}
              <div className="flex items-center gap-3">
                <img
                  src={event.organizingClub.logo}
                  className="w-7 h-7 rounded object-cover border border-white/10 grayscale-[0.3] hover:grayscale-0 transition-all"
                  alt={event.organizingClub.name}
                />
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
                  {event.organizingClub.name}
                </span>
              </div>
            </div>
          </div>

          {/* Rewards */}
          {hasRewards && (
            <div className="mb-4">
              <h2 className="text-xl mb-2">Rewards and Prizes</h2>
              <BorderedDiv className="flex-1 flex flex-col gap-4 p-4">
                {event.prize && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                      <Trophy />
                    </div>
                    ₹{event.prize}
                  </div>
                )}

                {event.providesCertificate && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                      <FileBadge />
                    </div>
                    Certificate
                  </div>
                )}

                {event.providesCertificate && (
                  <div className="pt-2">
                    <DownloadCertificateButton
                      eventId={String(event._id)}
                      eventName={event.name}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Available once your attendance is marked.
                    </p>
                  </div>
                )}
              </BorderedDiv>
            </div>
          )}

          {/* Details */}
          <div className="mb-4">
            <h2 className="text-xl mb-2">Details</h2>
            <BorderedDiv className="flex-1 min-w-0 p-4 whitespace-pre-line leading-relaxed">
              <p className="whitespace-pre-line">
                {formatDescription(event.description)}
              </p>
            </BorderedDiv>
          </div>

          {/* Registration Deadline */}
          <div className="mb-4">
            <h2 className="text-xl mb-2">Registration Deadline</h2>
            <BorderedDiv className="flex-1 p-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                  <Calendar />
                </div>
                {format(new Date(event.date), "PPP")}
              </div>
            </BorderedDiv>
          </div>

          {/* Event Capacity */}
          {event.maxRegistrations && (
            <div className="mb-4">
              <h2 className="text-xl mb-2">Registration Limit</h2>
              <BorderedDiv className="flex-1 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                    <Users />
                  </div>
                  <p>Up to {event.maxRegistrations} participants</p>
                </div>
              </BorderedDiv>
            </div>
          )}

          {/* Points */}
          {event._id != "69a7fa06cd938ddb63b0f06f" && (
            <div className="mb-4">
              <h2 className="text-xl mb-2">Points</h2>
              <BorderedDiv className="flex-1 flex flex-col gap-4 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                    <Award />
                  </div>
                  Participation: +10
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                    <Award />
                  </div>
                  Winner: +50
                </div>
              </BorderedDiv>
            </div>
          )}
        </div>

        {/* Right side sticky card */}
        {user && (
          <div className="grow ml-0 xl:ml-4 pb-4">
            <div className="flex flex-col gap-4 sticky top-2">
              <BorderedDiv className="rounded-xl shadow-md p-4">
                <h2 className="font-semibold text-3xl mb-2">
                  {event.registrationFee > 0
                    ? `₹${event.registrationFee}`
                    : "Free"}
                </h2>

                {event.registrationFee <= 0 ? (
                  <button
                    onClick={openRegistrationFlow}
                    disabled={isRegisterDisabled}
                    className={`w-full py-2 rounded-lg font-semibold mb-2 ${
                      isRegisterDisabled
                        ? "bg-[#000F57] opacity-50 cursor-not-allowed"
                        : "bg-[#000F57] text-white"
                    }`}
                  >
                    {isAlreadyRegistered
                      ? "Registered"
                      : hasEventPassed
                        ? "Registrations Closed"
                        : registrationStatus === "processing"
                          ? "Registering..."
                          : "Register"}
                  </button>
                ) : hasCustomQuestions && !hasSubmittedQuestions ? (
                  <button
                    onClick={() => {
                      setPendingAnswers([]);
                      setIsQuestionsModalOpen(true);
                    }}
                    disabled={isRegisterDisabled}
                    className={`w-full py-2 rounded-lg font-semibold mb-2 ${
                      isRegisterDisabled
                        ? "bg-[#000F57] opacity-50 cursor-not-allowed"
                        : "bg-[#000F57] text-white"
                    }`}
                  >
                    {ctaText}
                  </button>
                ) : (
                  <Payment
                    amount={event.registrationFee || 0}
                    eventId={event._id.toString()}
                    groupId={group?._id?.toString()}
                    customQuestionAnswers={pendingAnswers}
                    autoStartTrigger={paymentAutoStartTrigger}
                    text={ctaText}
                    disabled={
                      isRegisterDisabled ||
                      isAlreadyRegistered ||
                      hasEventPassed ||
                      isLoading
                    }
                    className={`w-full py-2 rounded-lg font-semibold mb-2 ${
                      isRegisterDisabled
                        ? "bg-[#000F57] opacity-50 cursor-not-allowed"
                        : "bg-[#000F57] text-white"
                    }`}
                    onSuccess={() => {
                      toast.success("Payment successful! You are registered.");
                      setRegistrationStatus("registered");
                      router.replace(`/events/${event._id}/success`);
                    }}
                  />
                )}

                <div className="flex ml-auto items-center gap-2 text-[#717171] my-2">
                  <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                    {event.eventType === "individual" ? <User /> : <Users />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs">Team Size</span>
                    <span className="text-sm">
                      {event.teamSize
                        ? event.teamSize
                        : event.teamSizeRange
                          ? `${event.teamSizeRange.min} - ${event.teamSizeRange.max}`
                          : "1"}
                    </span>
                  </div>
                </div>

                <div className="flex ml-auto items-center gap-2 text-[#717171] my-2">
                  <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                    <Calendar />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs">Registration Deadline</span>
                    <span className="text-sm">{daysLeft} days left</span>
                  </div>
                </div>
                {isAlreadyRegistered && event.whatsappGroupLink && (
                  <a
                    href={event.whatsappGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="flex ml-auto items-center gap-2 text-[#717171] my-2 hover:opacity-50">
                      <div className="flex items-center justify-center p-2 bg-green-600 rounded-lg text-white">
                        <MessageCircle />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-green-600">
                          Join WhatsApp group
                        </span>
                        <span className="text-xs">
                          Event updates will be shared here
                        </span>
                      </div>
                    </div>
                  </a>
                )}
              </BorderedDiv>
              {event.eventType === "team" && (
                <>
                  {group ? (
                    <>
                      <GroupCard
                        group={group}
                        isExpanded={true}
                        eventId={event._id}
                      />
                      {!group.isPublic && (
                        <CopyCodeButton code={group.joinCode} />
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href={`/events/${event._id}/groups/new`}>
                        <BorderedDiv className="rounded-full text-center">
                          Create group
                        </BorderedDiv>
                      </Link>
                      <Link href={`/events/${event._id}/groups`}>
                        <BorderedDiv className="rounded-full text-center">
                          Join group
                        </BorderedDiv>
                      </Link>
                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-800"></div>
                        <span className="flex-shrink-0 mx-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                          or
                        </span>
                        <div className="flex-grow border-t border-gray-800"></div>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 group hover:bg-white/5 rounded-full hover:cursor-pointer"
                      >
                        Continue with a past group{" "}
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </button>
                      <ContinueWithGroupModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        event={event}
                        user={user}
                      />
                    </div>
                  )}
                </>
              )}
              {user?.role === "club-admin" && (
                <Link href={`${event._id}/edit`} className="group block">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-gray-500  transition-all duration-300">
                    <Pencil
                      size={18}
                      className="text-gray-300 group-hover:text-white transition-colors"
                    />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                      Edit Event
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      {hasCustomQuestions && (
        <RegistrationQuestionsModal
          isOpen={isQuestionsModalOpen}
          onClose={() => {
            setIsQuestionsModalOpen(false);
            setHasSubmittedQuestions(false);
            setPendingAnswers([]);
          }}
          questions={event.customQuestions ?? []}
          isSubmitting={registrationStatus === "processing"}
          onSubmit={async (answers) => {
            setPendingAnswers(answers);
            setHasSubmittedQuestions(true);
            setIsQuestionsModalOpen(false);
            if (event.registrationFee > 0) {
              setPaymentAutoStartTrigger((prev) => prev + 1);
              return;
            }
            await handleRegister(answers);
          }}
        />
      )}
    </>
  );
}

function formatDescription(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        className="text-blue-400 underline break-all"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}
