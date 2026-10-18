"use client";

import { useSession } from "next-auth/react";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-8 flex flex-col items-center">
        <div className="w-24 h-24 bg-[var(--nx-primary)] rounded-full flex items-center justify-center text-4xl text-white font-bold mb-4 border-4 border-[var(--nx-accent)]">
          {session?.user?.name?.charAt(0).toUpperCase() || "N"}
        </div>
        <h1 className="text-2xl font-bold text-white">{session?.user?.name || "User"}</h1>
        <p className="text-[var(--nx-text-muted-updated)] mb-2">{session?.user?.email}</p>
        <span className="px-3 py-1 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-full text-sm text-[var(--nx-accent)] font-semibold mb-8">
          {session?.user?.role || "user"}
        </span>

        <div className="w-full flex flex-col gap-3">
          <button className="w-full py-3 px-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-left text-white hover:border-[var(--nx-accent)] transition-colors">
            Settings
          </button>
          <button className="w-full py-3 px-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-left text-white hover:border-[var(--nx-accent)] transition-colors">
            My Activity
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
