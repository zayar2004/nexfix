"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export function ApprovalGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const publicPaths = ["/login", "/register", "/pending-approval"];
    if (publicPaths.some((p) => pathname.startsWith(p))) return;

    const checkApproval = async () => {
      try {
        const res = await fetch("/api/sync", { cache: "no-store" });
        
        // 401 ပြန်ရင် Session မရှိတော့ဘူး (ဖျက်ခံလိုက်ရတယ်)
        if (res.status === 401) {
          await signOut({ callbackUrl: "/login" });
          return;
        }

        const data = await res.json();
        if (data.ok && data.data?.pendingApproval) {
          await signOut({ callbackUrl: "/login" });
        }
      } catch (err) {
        // Network error — ဒါကို လျစ်လျူရှုမယ်
      }
    };

    // Page ဝင်တိုင်း ၅ စက္ကန့်တစ်ခါ စစ်မယ်
    checkApproval();
    const interval = setInterval(checkApproval, 5000);
    return () => clearInterval(interval);
  }, [pathname]);

  return <>{children}</>;
}
