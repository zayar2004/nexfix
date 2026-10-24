import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';

export const DEFAULT_SOUND = 'default_notification';

function isInQuietHours(date: Date): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem('nexfix-reminder-settings');
  if (!saved) return false;
  try {
    const settings = JSON.parse(saved);
    if (!settings.quietHoursEnabled) return false;
    const [startH, startM] = (settings.quietHoursStart || "22:00").split(':').map(Number);
    const [endH, endM] = (settings.quietHoursEnd || "06:00").split(':').map(Number);
    const currentMinutes = date.getHours() * 60 + date.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    if (startMinutes < endMinutes) return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } catch { return false; }
}

function getReminderToggles(): { soundEnabled: boolean; vibrationEnabled: boolean } {
  if (typeof window === 'undefined') return { soundEnabled: true, vibrationEnabled: true };
  const saved = localStorage.getItem('nexfix-reminder-settings');
  if (!saved) return { soundEnabled: true, vibrationEnabled: true };
  try {
    const parsed = JSON.parse(saved);
    return {
      soundEnabled: parsed.soundEnabled ?? true,
      vibrationEnabled: parsed.vibrationEnabled ?? true,
    };
  } catch { return { soundEnabled: true, vibrationEnabled: true }; }
}

// Notification Action (Done/Skip) လုပ်တဲ့အခါ Database Update လုပ်ဖို့
export function setupNotificationActions() {
  if (!Capacitor.isNativePlatform()) return;
  
  LocalNotifications.addListener('localNotificationActionPerformed', async (notification: ActionPerformed) => {
    const actionId = notification.actionId;
    const noteId = notification.notification.extra?.noteId;
    
    if (!noteId) return;
    
    try {
      if (actionId === 'DONE') {
        // Task ကို Done လုပ်မယ်
        await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: noteId, isCompleted: true }),
        });
        // တခြား Notification တွေ ဖျက်မယ်
        const pending = await LocalNotifications.getPending();
        const toCancel = pending.notifications.filter(n => n.extra?.noteId === noteId);
        if (toCancel.length > 0) {
          await LocalNotifications.cancel({ notifications: toCancel });
        }
      } else if (actionId === 'SKIP') {
        // Task ကို Skip လုပ်မယ်
        await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: noteId, reminderAt: null, reminderEnabled: false }),
        });
        const pending = await LocalNotifications.getPending();
        const toCancel = pending.notifications.filter(n => n.extra?.noteId === noteId);
        if (toCancel.length > 0) {
          await LocalNotifications.cancel({ notifications: toCancel });
        }
      } else if (actionId === 'SNOOZE') {
        // 5 မိနစ် ရွှေ့မယ်
        const newTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: noteId, reminderAt: newTime }),
        });
      }
    } catch (err) {
      console.error("Action handler error:", err);
    }
  });
}

// Notification Permission တောင်းမယ်
export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    const perm = await LocalNotifications.requestPermissions();
    
    try {
      const exactPerm = await LocalNotifications.checkExactNotificationSetting();
      if (exactPerm.exact_alarm !== 'granted') {
        await LocalNotifications.changeExactNotificationSetting();
      }
    } catch (e) {}

    // Action Buttons (Done/Skip/Snooze) Register လုပ်မယ်
    try {
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'NEXFIX_ACTIONS',
            actions: [
              { id: 'DONE', title: '✅ Done', foreground: false },
              { id: 'SKIP', title: '⏭ Skip', foreground: false, destructive: true },
              { id: 'SNOOZE', title: '⏰ 5min', foreground: false },
            ],
          },
        ],
      });
    } catch (e) {
      console.log("Action types skipped", e);
    }

    // Channel ဖန်တီးမယ်
    try {
      const toggles = getReminderToggles();
      await LocalNotifications.createChannel({
        id: 'nexfix-alerts-v7',
        name: 'NEXFIX Alerts',
        description: 'Task reminders from NEXFIX',
        importance: 5,
        visibility: 1,
        sound: toggles.soundEnabled ? DEFAULT_SOUND : undefined,
        vibration: toggles.vibrationEnabled,
        lights: true,
      });
    } catch (e) {
      console.log("Channel creation skipped", e);
    }
    
    // Action Setup
    setupNotificationActions();
    
    return perm.display === 'granted';
  } else {
    if (!("Notification" in window)) return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
}

export async function scheduleNotification(
  id: string, 
  title: string, 
  body: string, 
  date: Date, 
  intervalMinutes: number = 0
) {
  if (date.getTime() <= Date.now()) return;
  
  if (isInQuietHours(date)) {
    console.log("Notification blocked by Quiet Hours");
    return;
  }
  
  const toggles = getReminderToggles();
  const channelId = 'nexfix-alerts-v7';

  if (Capacitor.isNativePlatform()) {
    try {
      const pending = await LocalNotifications.getPending();
      const existing = pending.notifications.filter(n => n.extra?.noteId === id);
      if (existing.length > 0) {
        await LocalNotifications.cancel({ notifications: existing });
      }

      const notificationsToSchedule = [];
      const repeatCount = intervalMinutes > 0 ? 5 : 1;
      
      for (let i = 0; i < repeatCount; i++) {
        const notifyTime = new Date(date.getTime() + (i * intervalMinutes * 60 * 1000));
        if (notifyTime.getTime() <= Date.now()) continue;
        
        notificationsToSchedule.push({
          title: i === 0 ? "NEXFIX Reminder" : `NEXFIX Reminder (${i + 1})`,
          body: title + (body ? `\n${body}` : ""),
          id: Math.floor(Math.random() * 100000) + i,
          schedule: { at: notifyTime, allowWhileIdle: true },
          channelId: channelId,
          sound: toggles.soundEnabled ? DEFAULT_SOUND : undefined,
          actionTypeId: 'NEXFIX_ACTIONS',
          extra: { noteId: id, repeatIndex: i }
        });
      }

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      }
    } catch (e) {
      console.error("Native Notif Error", e);
    }
  } else {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const delay = date.getTime() - Date.now();
      setTimeout(() => {
        registration.showNotification(title, {
          body: body,
          icon: '/icon-192.png',
          tag: id,
        } as any);
      }, delay);
    }
  }
}

export async function cancelNotification(noteId: string) {
  if (Capacitor.isNativePlatform()) {
    try {
      const pending = await LocalNotifications.getPending();
      const toCancel = pending.notifications.filter(n => n.extra?.noteId === noteId);
      if (toCancel.length > 0) {
        await LocalNotifications.cancel({ notifications: toCancel });
      }
    } catch (e) {}
  }
}
