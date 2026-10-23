"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

// ဒီ Component က Page တိုင်းမှာ ဝင်ပြီး Approve ဖြစ်မဖြစ် စစ်ဆေးမယ်
export function ApprovalGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Public Page တွေမှာ မစစ်ဘူး
    const publicPaths = ["/login", "/register", "/pending-approval"];
    if (publicPaths.some((p) => pathname.startsWith(p))) return;

    const checkApproval = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await res.json();

        if (session?.user) {
          const isAdmin = ["staff", "senior_admin", "super_admin"].includes(session.user.role);
          if (!session.user.isApproved && !isAdmin) {
            // Approve မဖြစ်ရင် Log Out လုပ်မယ်
            await signOut({ callbackUrl: "/login" });
          }
        }
      } catch (err) {
        console.error("Approval check failed", err);
      }
    };

    // Page ဝင်တိုင်း စစ်မယ်
    checkApproval();

    // နောက်ထပ် ၃၀ စက္ကန့်တစ်ခါ ထပ်စစ်မယ် (Revoke လုပ်လိုက်ရင် အမြန်သိအောင်)
    const interval = setInterval(checkApproval, 30000);
    return () => clearInterval(interval);
  }, [pathname, router]);

  return <>{children}</>;
}
