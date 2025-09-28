import { auth } from "@/auth";
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

      {/* Main content */}
      <div className="flex-1 pl-2">{children}</div>
    </div>
  );
}
