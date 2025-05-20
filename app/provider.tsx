"use client";

import React from "react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReduxProvider } from "./store/Provider";

interface ProvidersProps {
  children: React.ReactNode;
  session: Session | null | undefined;
}

export function Providers({ children, session }: ProvidersProps): React.ReactElement {
  return (
    <SessionProvider session={session}>
      <ReduxProvider>
        {children}
      </ReduxProvider>
    </SessionProvider>
  );
} 