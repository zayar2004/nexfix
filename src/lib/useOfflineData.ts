"use client";

import { useEffect, useState, useCallback } from "react";
import { getLocalData, saveLocalData, checkForUpdates } from "@/lib/local-db";

type UseOfflineDataOptions<T> = {
  // Local Storage ကနေ Data ယူဖို့ Function
  getLocal: () => Promise<T | null> | T | null;
  // Server ကနေ Data ယူဖို့ Function
  fetchServer: () => Promise<T | null>;
  // Local Storage မှာ Data သိမ်းဖို့ Function
  saveLocal?: (data: T) => Promise<void> | void;
  // Dependencies
  deps?: any[];
};

export function useOfflineData<T>(options: UseOfflineDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      // ၁။ Local Storage ကနေ အရင်ဖတ်မယ် (ချက်ချင်းပြ)
      const localData = await options.getLocal();
      if (localData) {
        setData(localData);
        setLoading(false);
      }

      // ၂။ Offline ဖြစ်ရင် ဒီမှာတင် ရပ်မယ်
      if (!navigator.onLine) {
        setIsOffline(true);
        setLoading(false);
        return;
      }

      setIsOffline(false);

      // ၃။ Online ဖြစ်ရင် Server ကနေ Sync လုပ်မယ်
      try {
        const serverData = await options.fetchServer();
        if (serverData) {
          setData(serverData);
          // Local Storage မှာ သိမ်းမယ်
          if (options.saveLocal) {
            await options.saveLocal(serverData);
          }
        }
      } catch (err) {
        console.error("Server fetch failed:", err);
      }

      setLoading(false);
    } catch (err) {
      console.error("Load data failed:", err);
      setError(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }, options.deps || []);

  useEffect(() => {
    loadData();

    // Online/Offline Event တွေ နားထောင်မယ်
    const handleOnline = () => {
      setIsOffline(false);
      loadData();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [loadData]);

  return {
    data,
    loading,
    isOffline,
    error,
    refresh: loadData,
  };
}
