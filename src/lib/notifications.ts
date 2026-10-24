import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Code ထဲက Default အသံ (public/sounds/default-notification.mp3)
export const DEFAULT_SOUND = 'default_notification';

// Quiet Hours ဖြစ်မဖြစ် စစ်ဆေးမယ်
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
    
    if (startMinutes < endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } catch {
    return false;
  }
}

// Sound/Vibration Settings
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
  } catch {
    return { soundEnabled: true, vibrationEnabled: true };
  }
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

    // Channel ကို Code ထဲက Default အသံနဲ့ ဖန်တီးမယ်
    try {
      const toggles = getReminderToggles();
      await LocalNotifications.createChannel({
        id: 'nexfix-reminders-v4',
        name: 'NEXFIX Reminders',
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
    
    return perm.display === 'granted';
  } else {
    if (!("Notification" in window)) return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
}

// Notification ကို အချိန်သတ်မှတ်မယ်
export async function scheduleNotification(
  id: string, 
  title: string, 
  body: string, 
  date: Date, 
  intervalMinutes: number = 0
) {
  if (date.getTime() <= Date.now()) return;
  
  // Quiet Hours ဖြစ်နေရင် Notification မပို့ဘူး
  if (isInQuietHours(date)) {
    console.log("Notification blocked by Quiet Hours");
    return;
  }
  
  const toggles = getReminderToggles();
  const channelId = 'nexfix-reminders-v4';

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

// Notification ဖျက်မယ်
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
