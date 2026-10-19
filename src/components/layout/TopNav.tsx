"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { saveLocalData, getLocalData } from "@/lib/local-db";
import { useNetwork } from "@/lib/network-context";
import { useSettings } from "@/lib/settings-context";

export function TopNav() {
  const router = useRouter();
  const { data: session } = useSession();
  const { mode, isInternetAvailable, setMode } = useNetwork();
  const { t } = useSettings();
  const [syncProgress, setSyncProgress] = useState(0);
  const isSyncingRef = useRef(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const savedPhoto = localStorage.getItem("nexfix_profile_photo");
    if (savedPhoto) setProfilePhoto(savedPhoto);
    
    const savedNotifs = localStorage.getItem("nexfix_notifications");
    if (savedNotifs) setNotifications(Number(savedNotifs) || 0);

    // 🌟 Notification Page က Update လုပ်တဲ့အခါ Badge ကို Update လုပ်မယ်
    const handleNotifUpdate = () => {
      const count = localStorage.getItem("nexfix_notifications");
      setNotifications(Number(count) || 0);
    };
    window.addEventListener("notifications-updated", handleNotifUpdate);
    return () => window.removeEventListener("notifications-updated", handleNotifUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const syncData = useCallback(async (isManual = false) => {
    if (isSyncingRef.current) return;
    if (!navigator.onLine) {
      if (isManual) showToast("❌ No internet connection");
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

      // 🌟 Local Data ကို ယူမယ်
      const oldData = await getLocalData();
      const oldLastUpdated = oldData?.lastSyncedAt ? Number(oldData.lastSyncedAt) : 0;
      const newLastUpdated = data.data.lastUpdated || 0;

      // 🌟 Data အသစ် ရှိမရှိ စစ်မယ်
      const hasNewData = newLastUpdated > oldLastUpdated;

      await saveLocalData(data.data);
      setSyncProgress(100);
      
      // 🌟 Data အသစ် ရှိရင် Notification ပြမယ်
      if (hasNewData && !isManual) {
        const newNotifs = notifications + 1;
        setNotifications(newNotifs);
        localStorage.setItem("nexfix_notifications", String(newNotifs));
        showToast("🔔 New content available!");
      } else if (isManual) {
        showToast("✅ Synced successfully");
      }
      
      setTimeout(() => {
        setMode("offline");
        setSyncProgress(0);
      }, 1500);
    } catch (err) {
      setMode("offline");
      if (isManual) showToast("❌ Sync failed");
    } finally {
      isSyncingRef.current = false;
    }
  }, [setMode, notifications]);

  // 🌟 App စဝင်တာနဲ့ Sync လုပ်မယ်
  useEffect(() => {
    if (!isInternetAvailable) return;
    const lastSync = localStorage.getItem("nexfix_last_sync");
    const now = Date.now();
    
    if (!lastSync || now - Number(lastSync) > 5 * 60 * 1000) {
      // ၅ မိနစ်ကျော်သွားရင် Sync လုပ်မယ်
      syncData(false).then(() => {
        localStorage.setItem("nexfix_last_sync", String(now));
      });
    }
  }, [syncData, isInternetAvailable]);

  // 🌟 နောက်ကွယ်ကနေ ၁ မိနစ်တစ်ခါ Auto Sync လုပ်မယ်
  useEffect(() => {
    if (!isInternetAvailable) return;
    const interval = setInterval(() => {
      syncData(false).then(() => {
        localStorage.setItem("nexfix_last_sync", String(Date.now()));
      });
    }, 60 * 1000); // ၁ မိနစ်
    return () => clearInterval(interval);
  }, [syncData, isInternetAvailable]);

  // Online Count
  useEffect(() => {
    if (!isInternetAvailable) return;
    const fetchCount = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        await fetch("/api/presence/count", { signal: controller.signal });
        clearTimeout(timeoutId);
      } catch {}
    };
    fetchCount();
    const cntInterval = setInterval(fetchCount, 5 * 60 * 1000);
    return () => clearInterval(cntInterval);
  }, [isInternetAvailable]);

  const handleNotificationClick = () => {
    router.push("/notifications");
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--nx-bg-base-deep)]/90 backdrop-blur-md border-b border-[var(--nx-border-updated)]">
      
      {/* 🌟 Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] bg-[var(--nx-accent)] text-black font-bold px-6 py-2 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between px-4 h-[var(--nx-top-nav-height)]">
        <button onClick={() => router.push("/")} className="flex items-center gap-2">
          <span className="text-xl font-black text-[var(--nx-accent)]">NEXFIX</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Sync Status */}
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

          {/* Notification Bell */}
          <button 
            onClick={handleNotificationClick}
            className="relative p-2 text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-accent)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--nx-error)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifications > 9 ? "9+" : notifications}
              </span>
            )}
          </button>

          {/* Sync Button */}
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

          {/* Profile */}
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
