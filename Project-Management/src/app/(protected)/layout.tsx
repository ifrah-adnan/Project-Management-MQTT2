import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "./_components/navbar";
import SessionProvider from "@/components/session-provider";
import SideBar from "./_components/sidebar";

import { SideBarMobile } from "./_components/sideBarMobile";
import { useMediaQuery } from "@/hooks/use-mediaQuery";
import SideBarLayout from "./_components/sideBarLayout.tsx";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  return (
    <SessionProvider session={session}>
      <main className="h-full w-full text-sm">
        <SideBarLayout />
        <div className="h-[calc(100vh-3.5rem)] w-full overflow-hidden  [&>*]:h-full [&>*]:w-full [&>*]:overflow-auto">
          {children}
        </div>
      </main>
    </SessionProvider>
  );
}
