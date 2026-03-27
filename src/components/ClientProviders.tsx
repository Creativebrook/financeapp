"use client";

import { FinanceProvider } from "@/context/FinanceContext";
import { SidebarProvider } from "@/context/SidebarContext";
import AuthGuard from "@/components/AuthGuard";
import { ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <FinanceProvider>
        <AuthGuard>
          {children}
        </AuthGuard>
      </FinanceProvider>
    </SidebarProvider>
  );
}
