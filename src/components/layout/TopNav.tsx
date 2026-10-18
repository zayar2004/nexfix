"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { saveLocalData, cacheImage } from "@/lib/local-db";

type SyncDataItem = {
  imageUrl?: string;
  mediaUrl?: string;
};

export function TopNav() {
  const { data: session } = useSession();
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [syncProgress, setSyncProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const syncData = async () => {
    if (syncStatus === "syncing") return;
    setSyncStatus("syncing");
    setSyncProgress(0);

    const progressInterval = setInterval(() => {
      setSyncProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 200);

    try {
      const res = await fetch("/api/sync");
      const json = await res.json();
      if (!json.ok) throw new Error("Sync failed");

      // 1. Cache Images
      const imageUrls: string[] = [
        ...(json.data.machines || []).map((m: SyncDataItem) => m.imageUrl).filter((u: string | undefined): u is string => !!u),
        ...(json.data.errorContents || []).map((c: SyncDataItem) => c.mediaUrl || c.imageUrl).filter((u: string | undefined): u is string => !!u),
      ];

      await Promise.all(imageUrls.map((url: string) => cacheImage(url)));

      // 2. Save Data to IndexedDB (with articles)
      await saveLocalData({
        machines: json.data.machines || [],
        errorCodes: json.data.errorCodes || [],
        errorContents: json.data.errorContents || [],
        articles: json.data.articles || [],
        articleContents: json.data.articleContents || [],
        lastSyncedAt: json.data.lastSyncedAt,
      });

      setSyncProgress(100);
      setSyncStatus("done");
    } catch {
      setSyncStatus("error");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--nx-bg-base-deep)]/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 h-[var(--nx-top-nav-height)]">
        <Link href="/" className="flex flex-col">
          <div className="flex items-baseline text-2xl font-black tracking-tighter italic">
            <span className="text-white">NEX</span>
            <span className="text-[var(--nx-accent-secondary)]">FIX</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-[var(--nx-text-muted-updated)] font-semibold">
            Arcade Technician Hub
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button onClick={syncData} disabled={syncStatus === "syncing"} className="relative p-2 text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-accent)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={syncStatus === "syncing" ? "animate-spin" : ""}>
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/>
            </svg>
            {syncStatus === "syncing" && <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[var(--nx-accent)]">{syncProgress}%</span>}
            {syncStatus === "done" && <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[var(--nx-success)]">Done</span>}
          </button>

          <button className="relative p-2 text-[var(--nx-text-primary)] hover:text-[var(--nx-accent-secondary)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--nx-error)] rounded-full border border-[var(--nx-bg-base-deep)]"></span>
          </button>

          <div className="flex items-center gap-1.5 text-[var(--nx-accent-secondary)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            <span className="text-sm font-semibold">24</span>
          </div>

          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--nx-primary)] text-white text-sm font-bold border border-[var(--nx-primary)] hover:brightness-110">
              {session?.user?.name?.charAt(0).toUpperCase() || "N"}
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-[var(--nx-border-updated)]">
                  <p className="text-sm font-semibold text-white truncate">{session?.user?.name || "User"}</p>
                  <p className="text-xs text-[var(--nx-text-muted-updated)] truncate">{session?.user?.email}</p>
                </div>
                <Link href="/profile" className="block px-4 py-3 text-sm text-white hover:bg-[var(--nx-bg-surface-deep)] transition-colors" onClick={() => setShowMenu(false)}>My Profile</Link>
                <button onClick={() => { setShowMenu(false); signOut({ callbackUrl: "/login" }); }} className="w-full text-left px-4 py-3 text-sm text-[var(--nx-error)] hover:bg-[var(--nx-bg-surface-deep)] transition-colors border-t border-[var(--nx-border-updated)]">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
