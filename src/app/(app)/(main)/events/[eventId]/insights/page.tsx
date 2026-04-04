import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import EventInsightsDashboard from "@/components/Events/EventInsightsDashboard";

const getEventInsights = async (eventId: string) => {
  const nextHeaders = await headers();
  const cookieHeader = nextHeaders.get("cookie") ?? "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${eventId}/insights`,
    {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    },
  );

  if (res.status === 401) {
    redirect(`/login?callbackUrl=/events/${eventId}/insights`);
  }

  if (res.status === 403) {
    redirect("/forbidden");
  }

  if (!res.ok) return null;

  return res.json();
};

export default async function EventInsightsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const insights = await getEventInsights(eventId);

  if (!insights?.event) {
    notFound();
  }

  return <EventInsightsDashboard data={insights} />;
}
