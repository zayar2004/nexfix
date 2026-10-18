"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function AdminTopbar({ title }: { title: string }) {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-14 bg-[var(--nx-bg-base-deep)]/90 backdrop-blur-md border-b border-[var(--nx-border-updated)]">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <h1 className="text-sm lg:text-base font-semibold text-white ml-10 lg:ml-0">{title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--nx-text-muted-updated)] hidden md:block">
            {session?.user?.email}
          </span>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--nx-primary)]/20 text-[var(--nx-primary)] border border-[var(--nx-primary)]/30 font-semibold hidden sm:block">
            Admin
          </span>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--nx-primary)] text-white text-sm font-bold hover:brightness-110"
            >
              {session?.user?.name?.charAt(0).toUpperCase() || "A"}
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-[var(--nx-border-updated)]">
                  <p className="text-sm font-semibold text-white truncate">{session?.user?.name || "Admin"}</p>
                  <p className="text-xs text-[var(--nx-text-muted-updated)] truncate">{session?.user?.email}</p>
                  <p className="text-xs text-[var(--nx-accent)] mt-1">{session?.user?.role}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="w-full text-left px-4 py-3 text-sm text-[var(--nx-error)] hover:bg-[var(--nx-bg-surface-deep)] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
