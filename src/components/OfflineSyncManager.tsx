"use client";

import { useEffect, useState } from "react";
import { getQueue, removeFromQueue, getOfflineNotes, removeOfflineNote } from "@/lib/offline-queue";
import { useSession } from "next-auth/react";

export function OfflineSyncManager() {
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // App စတင်တာနဲ့ Sync လုပ်မယ်
    if (navigator.onLine && session?.user) {
      syncQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [session]);

  const syncQueue = async () => {
    if (!navigator.onLine || !session?.user) return;

    const queue = getQueue();
    if (queue.length === 0) {
      // Queue မရှိရင်လည်း Offline Notes တွေ ရှိမရှိ စစ်မယ်
      const offlineNotes = getOfflineNotes();
      for (const note of offlineNotes) {
        try {
          await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(note),
          });
          removeOfflineNote(note.id);
        } catch (err) {
          console.error("Offline note sync failed:", err);
        }
      }
      return;
    }

    console.log(`Syncing ${queue.length} offline actions...`);

    for (const action of queue) {
      try {
        if (action.type === "create") {
          await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action.payload),
          });
        } else if (action.type === "update") {
          await fetch("/api/notes", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action.payload),
          });
        } else if (action.type === "delete") {
          await fetch(`/api/notes?id=${action.payload.id}`, { method: "DELETE" });
        }
        removeFromQueue(action.id);
      } catch (err) {
        console.error("Sync failed for action:", action.id, err);
      }
    }

    // Offline Notes တွေကို Sync
    const offlineNotes = getOfflineNotes();
    for (const note of offlineNotes) {
      try {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(note),
        });
        removeOfflineNote(note.id);
      } catch (err) {
        console.error("Offline note sync failed:", err);
      }
    }

    console.log("Sync complete");
  };

  return null;
}
