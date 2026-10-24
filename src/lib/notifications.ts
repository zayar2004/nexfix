import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface NotificationSettings {
  customSoundUri: string | null;
  repeatIntervalMinutes: number;
  soundName: string | null;
  channelId: string | null;
  useDefaultSound: boolean;
}

export const DEFAULT_SOUND = '/sounds/default-notification.mp3';


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
    
    // တစ်ရက်တည်း (ဥပမာ - 10:00 - 18:00)
    if (startMinutes < endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
    // ညဖြတ် (ဥပမာ - 22:00 - 06:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } catch {
    return false;
  }
}

// Sound/Vibration Settings ကို ယူမယ်
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

export function getSettings(): NotificationSettings {
  if (typeof window === 'undefined') {
    return { customSoundUri: null, repeatIntervalMinutes: 0, soundName: null, channelId: null, useDefaultSound: true };
  }
  const saved = localStorage.getItem('nexfix-notif-settings');
  if (saved) {
    try { return { ...JSON.parse(saved), useDefaultSound: JSON.parse(saved).useDefaultSound ?? true }; } catch { /* ignore */ }
  }
  return { customSoundUri: null, repeatIntervalMinutes: 0, soundName: null, channelId: null, useDefaultSound: true };
}

export function saveSettings(settings: NotificationSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('nexfix-notif-settings', JSON.stringify(settings));
}

export async function saveCustomSound(file: File): Promise<{ uri: string; channelId: string } | null> {
  if (!Capacitor.isNativePlatform()) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ uri: reader.result as string, channelId: `nexfix-${Date.now()}` });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const fileName = `nexfix-sound-${Date.now()}.mp3`;
    await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Data,
      recursive: true,
    });

    const uriResult = await Filesystem.getUri({
      path: fileName,
      directory: Directory.Data,
    });

    const channelId = `nexfix-reminders-${Date.now()}`;
    return { uri: uriResult.uri, channelId };
  } catch (e) {
    console.error("Save sound error:", e);
    return null;
  }
}

export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    const perm = await LocalNotifications.requestPermissions();
    
    try {
      const exactPerm = await LocalNotifications.checkExactNotificationSetting();
      if (exactPerm.exact_alarm !== 'granted') {
        await LocalNotifications.changeExactNotificationSetting();
      }
    } catch (e) {}

    try {
      const settings = getSettings();
      const channelId = settings.channelId || 'nexfix-reminders-default';
      
      await LocalNotifications.createChannel({
        id: channelId,
        name: `NEXFIX Reminders`,
        description: 'Task reminders from NEXFIX',
        importance: 5,
        visibility: 1,
        sound: settings.useDefaultSound ? DEFAULT_SOUND : (settings.customSoundUri || DEFAULT_SOUND),
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
  
  const settings = getSettings();
  const toggles = getReminderToggles();
  const repeatMin = intervalMinutes; // Task ရဲ့ Interval ကို သုံးမယ်
  const channelId = settings.channelId || 'nexfix-reminders-default';
  const sound = settings.useDefaultSound ? DEFAULT_SOUND : (settings.customSoundUri || DEFAULT_SOUND);

  if (Capacitor.isNativePlatform()) {
    try {
      const pending = await LocalNotifications.getPending();
      const existing = pending.notifications.filter(n => n.extra?.noteId === id);
      if (existing.length > 0) {
        await LocalNotifications.cancel({ notifications: existing });
      }

      const notificationsToSchedule = [];
      const repeatCount = repeatMin > 0 ? 5 : 1;
      
      for (let i = 0; i < repeatCount; i++) {
        const notifyTime = new Date(date.getTime() + (i * repeatMin * 60 * 1000));
        if (notifyTime.getTime() <= Date.now()) continue;
        
        notificationsToSchedule.push({
          title: i === 0 ? title : `⏰ ${title}`,
          body: i === 0 ? body : `(Reminder ${i + 1}) ${body}`,
          id: Math.floor(Math.random() * 100000) + i,
          schedule: { 
            at: notifyTime, 
            allowWhileIdle: true,
          },
          channelId: channelId,
          sound: sound,
          extra: { 
            noteId: id,
            repeatIndex: i,
          }
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
