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
      // Skip check if offline
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return;
      }

      try {
        const res = await fetch("/api/sync", { cache: "no-store" });
        
        // 401 returned means session is invalid
        if (res.status === 401) {
          await signOut({ callbackUrl: "/login" });
          return;
        }

        const data = await res.json();
        if (data.ok && data.data?.pendingApproval) {
          await signOut({ callbackUrl: "/login" });
        }
      } catch (err) {
        // Network error — silently ignore, keep offline state
      }
    };

    // Run once on mount (if online)
    checkApproval();

    // Setup interval — only runs checkApproval if online
    const interval = setInterval(checkApproval, 10000); // 10s instead of 5s

    // Re-check when network comes back
    const handleOnline = () => {
      checkApproval();
    };
    window.addEventListener("online", handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
    };
  }, [pathname]);

  return <>{children}</>;
}
