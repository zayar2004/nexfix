"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useNetwork } from "@/lib/network-context";

export default function ChatPage() {
  const router = useRouter();
  const { forceOnlineForChat, returnToOffline } = useNetwork();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Chat page ထဲ ဝင်တာနဲ့ Online Mode ချိန်မယ်
    forceOnlineForChat();
    setIsOffline(!navigator.onLine);

    // Chat page ကနေ ထွက်သွားရင် Offline ပြန်ချိန်မယ်
    return () => {
      returnToOffline();
    };
  }, [forceOnlineForChat, returnToOffline]);

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav flex flex-col">
      <TopNav />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {!navigator.onLine ? (
          <div className="text-center p-6 bg-[var(--nx-bg-card)] border border-[var(--nx-error)]/30 rounded-xl">
            <h2 className="text-lg font-bold text-[var(--nx-error)] mb-2">Connection Error</h2>
            <p className="text-[var(--nx-text-secondary-updated)] text-sm">Chat requires an active internet connection. Please check your network.</p>
            <button 
              onClick={() => router.refresh()} 
              className="mt-4 px-4 py-2 bg-[var(--nx-accent)] text-black font-bold rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-[var(--nx-bg-card)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--nx-border-updated)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Public Chat</h1>
            <p className="text-[var(--nx-text-muted-updated)]">Chat feature is coming soon.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
