import NewGroupForm from "@/components/Groups/NewGroupForm";

export default async function NewGroupPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <NewGroupForm eventId={eventId} />;
}
