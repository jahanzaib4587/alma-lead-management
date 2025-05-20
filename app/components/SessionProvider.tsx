"use client";

import React from "react";
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

interface SessionProviderProps {
  children: React.ReactNode;
  session: Session | null | undefined;
}

export function SessionProvider({ 
  children, 
  session 
}: SessionProviderProps): React.ReactElement {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
} 