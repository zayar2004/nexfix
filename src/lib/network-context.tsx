"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type NetworkMode = "offline" | "syncing" | "online";

interface NetworkContextType {
  mode: NetworkMode;
  isInternetAvailable: boolean;
  setMode: (mode: NetworkMode) => void;
  forceOnlineForChat: () => void;
  returnToOffline: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<NetworkMode>("offline");
  const [isInternetAvailable, setIsInternetAvailable] = useState(true);

  useEffect(() => {
    const updateStatus = () => setIsInternetAvailable(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  const forceOnlineForChat = () => {
    if (isInternetAvailable) setMode("online");
  };

  const returnToOffline = () => {
    setMode("offline");
  };

  return (
    <NetworkContext.Provider value={{ mode, isInternetAvailable, setMode, forceOnlineForChat, returnToOffline }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
