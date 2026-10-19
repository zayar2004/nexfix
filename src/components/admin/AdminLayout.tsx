"use client";

import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

export function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === "/admin";

  return (
    <div className="flex min-h-screen bg-[var(--nx-bg-base-deep)]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar title={title} />
        <main className="flex-1 p-4 lg:p-8">
          {/* Back Button (Not shown on Dashboard) */}
          {!isDashboard && (
            <button 
              onClick={() => router.back()} 
              className="mb-6 flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--nx-text-muted-updated)] hover:text-white bg-[var(--nx-bg-surface-deep)] border border-[var(--nx-border-updated)] rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Back
            </button>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
