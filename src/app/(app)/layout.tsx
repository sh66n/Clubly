import { auth } from "@/auth";
import MobileNavbar from "@/components/MobileNavbar";
import Sidebar from "@/components/Sidebar";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar points={session?.user.points} />
      <MobileNavbar />
      {/* Main content */}
      <div className="flex-1 pl-2 pr-2 pb-20 md:pb-0">{children}</div>
    </div>
  );
}
