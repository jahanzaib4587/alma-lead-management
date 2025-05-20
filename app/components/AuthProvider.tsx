"use client";

import React from "react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Session | null | undefined;
}

export default function AuthProvider({ children, session }: AuthProviderProps): React.ReactElement {
  return <SessionProvider session={session}>{children}</SessionProvider>;
} 