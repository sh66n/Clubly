import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import EventInsightsDashboard from "@/components/Events/EventInsightsDashboard";
import { getEventInsightsData } from "@/services/getEventInsightsData";

export default async function EventInsightsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  const { eventId } = await params;

  if (!session?.user) {
    redirect(`/login?callbackUrl=/events/${eventId}/insights`);
  }

  if (session.user.role !== "club-admin" && session.user.role !== "admin") {
    redirect("/forbidden");
  }

  const insights = await getEventInsightsData(eventId);

  if (!insights?.event) {
    notFound();
  }

  if (
    session.user.role === "club-admin" &&
    insights.event.organizingClub?._id?.toString() !==
      session.user.adminClub?.toString()
  ) {
    redirect("/forbidden");
  }

  return <EventInsightsDashboard data={insights} />;
}
