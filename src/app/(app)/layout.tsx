import { auth } from "@/auth";
import MobileNavbar from "@/components/MobileNavbar";
import Sidebar from "@/components/Sidebar";
import { getUserPoints } from "@/services/getUserPoints";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const points = await getUserPoints(session?.user?.email);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar isLoggedIn={session ? true : false} points={points} />
      <MobileNavbar user={session?.user} />
      {/* Main content */}
      <div className="flex-1 pl-2 pr-2 pb-20 md:pb-0">{children}</div>
    </div>
  );
}
