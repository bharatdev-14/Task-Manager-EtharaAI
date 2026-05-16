"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/providers/ToastProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
