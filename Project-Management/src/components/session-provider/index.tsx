"use client";

import React, { useEffect } from "react";
import { Session } from "@/lib/auth";
import { useRouter } from "next/navigation";

const SessionContext = React.createContext<{
  session: Session;
} | null>(null);

// export default SessionContext;

export function useSession() {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error(`useSession must be used within a App SessionContext`);
  }
  return context;
}

type SessionProviderProps = {
  children: React.ReactNode;
  session: Session;
};

export default function SessionProvider({
  children,
  session,
}: SessionProviderProps) {
  const router = useRouter();
  useEffect(() => {
    if (!session) router.push("/sign-in");
  }, [router, session]);
  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
}
