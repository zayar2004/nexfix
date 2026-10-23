import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Settings ကို LocalStorage မှာ သိမ်းမယ်
export interface NotificationSettings {
  customSound: string | null; // mp3 file name
  repeatIntervalMinutes: number;
  soundName: string | null;
}

export function getSettings(): NotificationSettings {
  if (typeof window === 'undefined') {
    return { customSound: null, repeatIntervalMinutes: 0, soundName: null };
  }
  const saved = localStorage.getItem('nexfix-notif-settings');
  if (saved) {
    try { return JSON.parse(saved); } catch { /* ignore */ }
  }
  return { customSound: null, repeatIntervalMinutes: 0, soundName: null };
}

export function saveSettings(settings: NotificationSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('nexfix-notif-settings', JSON.stringify(settings));
}

export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    const perm = await LocalNotifications.requestPermissions();
    
    // Android 13+ Exact Alarm
    try {
      const exactPerm = await LocalNotifications.checkExactNotificationSetting();
      if (exactPerm.exact_alarm !== 'granted') {
        await LocalNotifications.changeExactNotificationSetting();
      }
    } catch (e) {}
    
    // Notification Channel ကို Custom Sound နဲ့ ဖန်တီးမယ်
    try {
      await LocalNotifications.createChannel({
        id: 'nexfix-reminders',
        name: 'NEXFIX Reminders',
        description: 'Task reminders from NEXFIX',
        importance: 5, // High (Heads-up)
        visibility: 1, // Public
        sound: getSettings().soundName || undefined,
        vibration: true,
        lights: true,
      });
    } catch (e) {
      console.log("Channel creation skipped", e);
    }
    
    return perm.display === 'granted';
  } else {
    if (!("Notification" in window)) return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
}

export async function scheduleNotification(id: string, title: string, body: string, date: Date) {
  if (date.getTime() <= Date.now()) return;
  
  const settings = getSettings();

  if (Capacitor.isNativePlatform()) {
    try {
      // အဟောင်း ဖျက်မယ်
      const pending = await LocalNotifications.getPending();
      const existing = pending.notifications.filter(n => n.extra?.noteId === id);
      if (existing.length > 0) {
        await LocalNotifications.cancel({ notifications: existing });
      }

      // Notification အသစ် သတ်မှတ်မယ်
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: Math.floor(Math.random() * 100000),
            schedule: { 
              at: date, 
              allowWhileIdle: true,
            },
            channelId: 'nexfix-reminders',
            sound: settings.soundName || undefined,
            extra: { 
              noteId: id,
              repeatInterval: settings.repeatIntervalMinutes,
              originalTitle: title,
              originalBody: body,
            }
          }
        ]
      });
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
