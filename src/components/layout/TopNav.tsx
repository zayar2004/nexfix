"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function TopNav() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-[var(--nx-bg-base-deep)]/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 h-[var(--nx-top-nav-height)]">
        {/* Brand Wordmark */}
        <Link href="/" className="flex flex-col">
          <div className="flex items-baseline text-2xl font-black tracking-tighter italic">
            <span className="text-white">NEX</span>
            <span className="text-[var(--nx-accent-secondary)]">FIX</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-[var(--nx-text-muted-updated)] font-semibold">
            Arcade Technician Hub
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative p-2 text-[var(--nx-text-primary)] hover:text-[var(--nx-accent-secondary)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--nx-error)] rounded-full border border-[var(--nx-bg-base-deep)]"></span>
          </button>

          {/* Online Count (Dummy for UI, Real Presence system will be added later) */}
          <div className="flex items-center gap-1.5 text-[var(--nx-accent-secondary)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-sm font-semibold">24</span>
          </div>

          {/* Profile Avatar */}
          <Link href="/profile" className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--nx-primary)] text-white text-sm font-bold border border-[var(--nx-primary)] hover:brightness-110">
            {session?.user?.name?.charAt(0).toUpperCase() || "N"}
          </Link>
        </div>
      </div>
    </header>
  );
}
