"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { saveLocalData } from "@/lib/local-db";
import { useNetwork } from "@/lib/network-context";
import { useSettings } from "@/lib/settings-context";

export function TopNav() {
  const router = useRouter();
  const { data: session } = useSession();
  const { mode, isInternetAvailable, setMode } = useNetwork();
  const { t } = useSettings();
  const [syncProgress, setSyncProgress] = useState(0);
  const isSyncingRef = useRef(false);
  
  // 🌟 Profile Photo အတွက် State အသစ်
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // App စဝင်တာနဲ့ Profile Photo ကို LocalStorage ကနေ ယူမယ်
  useEffect(() => {
    const savedPhoto = localStorage.getItem("nexfix_profile_photo");
    if (savedPhoto) setProfilePhoto(savedPhoto);
  }, []);

  const syncData = useCallback(async (isManual = false) => {
    if (isSyncingRef.current) return;
    if (!navigator.onLine) {
      if (isManual) alert("❌ " + (t("connectionError") || "No internet connection."));
      return;
    }

    isSyncingRef.current = true;
    setMode("syncing");
    setSyncProgress(10);

    try {
      const res = await fetch("/api/sync");
      setSyncProgress(50);
      const data = await res.json();
      if (!data.ok) throw new Error("Sync failed");

      await saveLocalData(data.data);
      setSyncProgress(100);
      
      setTimeout(() => {
        setMode("offline");
        setSyncProgress(0);
      }, 1500);
    } catch (err) {
      setMode("offline");
      if (isManual) alert("❌ Sync failed.");
    } finally {
      isSyncingRef.current = false;
    }
  }, [setMode, t]);

  useEffect(() => {
    if (!isInternetAvailable) return;
    const lastSync = localStorage.getItem("nexfix_last_sync");
    const now = Date.now();
    
    if (!lastSync || now - Number(lastSync) > 24 * 60 * 60 * 1000) {
      syncData(false).then(() => {
        localStorage.setItem("nexfix_last_sync", String(now));
      });
    }
  }, [syncData, isInternetAvailable]);

  useEffect(() => {
    if (!isInternetAvailable) return;
    
    const fetchCount = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        await fetch("/api/presence/count", { signal: controller.signal });
        clearTimeout(timeoutId);
      } catch (err) {}
    };
    
    fetchCount();
    const cntInterval = setInterval(fetchCount, 5 * 60 * 1000);
    return () => clearInterval(cntInterval);
  }, [isInternetAvailable]);

  return (
    <header className="sticky top-0 z-50 bg-[var(--nx-bg-base-deep)]/90 backdrop-blur-md border-b border-[var(--nx-border-updated)]">
      <div className="flex items-center justify-between px-4 h-[var(--nx-top-nav-height)]">
        <button onClick={() => router.push("/")} className="flex items-center gap-2">
          <span className="text-xl font-black text-[var(--nx-accent)]">NEXFIX</span>
        </button>

        <div className="flex items-center gap-3">
          {mode === "syncing" ? (
             <span className="text-xs font-bold text-[var(--nx-accent)] bg-[var(--nx-accent)]/10 px-2 py-1 rounded-md animate-pulse">SYNCING {syncProgress}%</span>
          ) : mode === "online" ? (
             <span className="text-xs font-bold text-[var(--nx-success)] bg-[var(--nx-success)]/10 px-2 py-1 rounded-md">ONLINE</span>
          ) : (
            <div className="flex items-center gap-1 text-xs text-[var(--nx-text-muted-updated)]">
              <span className="w-2 h-2 bg-[var(--nx-warning)] rounded-full"></span>
              <span className="font-bold text-[var(--nx-warning)]">OFFLINE</span>
            </div>
          )}

          <button 
            onClick={() => syncData(true)} 
            disabled={mode === "syncing" || !isInternetAvailable} 
            className={`relative p-2 transition-colors ${!isInternetAvailable ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-accent)]'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mode === "syncing" ? "animate-spin" : ""}>
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </button>

          {/* 🌟 Profile Icon (ပုံရှိရင် ပုံပြ၊ မရှိရင် N ပြ) */}
          <button 
            onClick={() => router.push("/profile")} 
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm border border-[var(--nx-border-updated)] hover:border-[var(--nx-accent)] transition-colors"
            style={profilePhoto ? { backgroundImage: `url(${profilePhoto})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : { backgroundColor: 'var(--nx-accent)', color: 'black' }}
          >
            {!profilePhoto && (session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "N")}
          </button>
        </div>
      </div>
    </header>
  );
}
