import { auth } from "@/auth";
import FacultyCoordinatorDashboardClient from "./FacultyCoordinatorDashboardClient";

export default async function FacultyCoordinatorDashboardPage() {
  const session = await auth();

  return <FacultyCoordinatorDashboardClient user={session?.user} />;
}
