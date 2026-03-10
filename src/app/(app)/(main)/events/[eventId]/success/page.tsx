import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle, ArrowLeft, ExternalLink } from "lucide-react";

import { getEvent } from "@/services/getEvent";
import { IEvent } from "@/models/event.schema";
import SuccessIcon from "@/components/Events/SuccessIcon";
import { auth } from "@/auth";

export default async function RegistrationSuccess({
  params,
}: {
  params: { eventId: String };
}) {
  const { eventId } = await params;

  const event: IEvent = await getEvent(eventId);
  const session = await auth();

  /* ------------------------------
     Guards
  ------------------------------ */

  if (!event) {
    return (
      <div className="min-h-screen bg-black text-zinc-500 flex items-center justify-center font-light">
        Event not found.
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  /* ------------------------------
     Check registration
  ------------------------------ */

  let isRegistered = false;

  if (event.eventType === "individual") {
    isRegistered =
      event.registrations?.some(
        (u: any) => u._id.toString() === session.user.id,
      ) ?? false;
  } else {
    isRegistered =
      event.groupRegistrations?.some((g: any) =>
        g.members?.some((m: any) => m._id.toString() === session.user.id),
      ) ?? false;
  }

  if (!isRegistered) {
    redirect(`/events/${eventId}`);
  }

  /* ------------------------------
     UI
  ------------------------------ */

  return (
    <div className="h-full text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-10">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <SuccessIcon />

          <div className="space-y-1">
            <h1 className="text-2xl font-medium text-white tracking-tight">
              {event.registrationFee > 0 &&
              event._id != "69a7fa06cd938ddb63b0f06f"
                ? "Payment Received"
                : "Registration Successful"}
            </h1>

            <p className="text-zinc-500 text-sm">
              Successfully registered for{" "}
              <span className="text-zinc-300">{event.name}</span>
            </p>
          </div>
        </div>

        {/* WhatsApp */}
        {event.whatsappGroupLink && (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold text-center">
              All further updates will be shared here
            </p>

            <a
              href={event.whatsappGroupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all active:scale-[0.98]"
            >
              <MessageCircle className="h-5 w-5" />
              Join WhatsApp Group
              <ExternalLink className="h-4 w-4 opacity-50" />
            </a>
          </div>
        )}

        {/* Back */}
        <div className="flex justify-center pt-4">
          <Link
            href="/events"
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
}
