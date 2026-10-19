"use client";

import { SessionProvider } from "next-auth/react";
import { AdminLangProvider } from "@/lib/admin-lang-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLangProvider>
        {children}
      </AdminLangProvider>
    </SessionProvider>
  );
}
