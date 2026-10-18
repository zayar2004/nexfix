"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveLocalData } from "@/lib/local-db";
import { useNetwork } from "@/lib/network-context";

export function TopNav() {
  const router = useRouter();
  const { mode, isInternetAvailable, setMode } = useNetwork();
  const [syncProgress, setSyncProgress] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const isSyncingRef = useRef(false);

  // Sync လုပ်တဲ့ Function
  const syncData = useCallback(async (isManual = false) => {
    if (isSyncingRef.current) return;
    if (!navigator.onLine) {
      if (isManual) alert("❌ Internet မရှိပါ။");
      return;
    }

    isSyncingRef.current = true;
    setMode("syncing"); // Sync လုပ်နေစဉ်
    setSyncProgress(10);

    try {
      const res = await fetch("/api/sync");
      setSyncProgress(50);
      const data = await res.json();
      if (!data.ok) throw new Error("Sync failed");

      await saveLocalData(data.data);
      setSyncProgress(100);
      
      setTimeout(() => {
        setMode("offline"); // Sync ပြီးရင် Offline ပြန်ချိန်မယ်
        setSyncProgress(0);
      }, 1500);
    } catch (err) {
      setMode("offline"); // Error တက်ရင်လည်း Offline ပြန်ချိန်မယ်
      if (isManual) alert("❌ Sync failed.");
    } finally {
      isSyncingRef.current = false;
    }
  }, [setMode]);

  // App စဝင်တာနဲ့ တစ်ခါပဲ လုပ်မယ်
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

  // Online Count ကို ၅ မိနစ်တစ်ခါပဲ စစ်မယ် (ဖုန်းကို မလေးစေရန်)
  useEffect(() => {
    if (!isInternetAvailable) return;
    
    const fetchCount = async () => {
      try {
        // Timeout ထည့်ထားမယ် (၃ စက္ကန့်အတွင်း မရရင် ရပ်မယ်)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const res = await fetch("/api/presence/count", { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const data = await res.json();
        if (data.ok) setOnlineCount(data.count);
      } catch (err) {
        // Error တက်ရင် ဘာမှ မလုပ်ဘူး (တိတ်တဆိတ် ကျော်သွားမယ်)
      }
    };
    
    fetchCount();
    const cntInterval = setInterval(fetchCount, 5 * 60 * 1000); // ၅ မိနစ်တစ်ခါ
    return () => clearInterval(cntInterval);
  }, [isInternetAvailable]);

  return (
    <header className="sticky top-0 z-50 bg-[var(--nx-bg-base-deep)]/90 backdrop-blur-md border-b border-[var(--nx-border-updated)]">
      <div className="flex items-center justify-between px-4 h-[var(--nx-top-nav-height)]">
        <button onClick={() => router.push("/")} className="flex items-center gap-2">
          <span className="text-xl font-black text-[var(--nx-accent)]">NEXFIX</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Mode ပြသမယ့် နေရာ */}
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

          <button onClick={() => router.push("/profile")} className="p-2 text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-accent)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
