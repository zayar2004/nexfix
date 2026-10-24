"use client";

import { useEffect } from "react";
import { setupNotificationActions } from "@/lib/notifications";
import { Capacitor } from "@capacitor/core";

export function NotificationSetup() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setupNotificationActions();
    }
  }, []);
  return null;
}
