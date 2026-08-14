import FeedbackFormEditor from "@/components/ClubAdmin/FeedbackFormEditor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Feedback Form | Clubly",
};

export default async function EditFeedbackFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FeedbackFormEditor formId={id} />;
}
