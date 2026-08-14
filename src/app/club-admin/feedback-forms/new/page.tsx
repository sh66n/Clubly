import FeedbackFormEditor from "@/components/ClubAdmin/FeedbackFormEditor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Feedback Form | Clubly",
};

export default function NewFeedbackFormPage() {
  return <FeedbackFormEditor />;
}
