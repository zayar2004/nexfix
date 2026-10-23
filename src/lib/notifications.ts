import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface NotificationSettings {
  customSoundUri: string | null;
  repeatIntervalMinutes: number;
  soundName: string | null;
}

export function getSettings(): NotificationSettings {
  if (typeof window === 'undefined') {
    return { customSoundUri: null, repeatIntervalMinutes: 0, soundName: null };
  }
  const saved = localStorage.getItem('nexfix-notif-settings');
  if (saved) {
    try { return JSON.parse(saved); } catch { /* ignore */ }
  }
  return { customSoundUri: null, repeatIntervalMinutes: 0, soundName: null };
}

export function saveSettings(settings: NotificationSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('nexfix-notif-settings', JSON.stringify(settings));
}

// MP3 ဖိုင်ကို Native မှာ သိမ်းမယ်
export async function saveCustomSound(file: File): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) {
    // Web အတွက် - Data URL အနေနဲ့ သိမ်းမယ်
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  try {
    // Native (Android) အတွက် - File ကို Base64 ပြောင်းပြီး App ထဲမှာ သိမ်းမယ်
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // data:audio/mp3;base64,xxxx ကနေ base64 ကို ယူမယ်
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

    // URI ကို ပြန်ယူမယ်
    const uriResult = await Filesystem.getUri({
      path: fileName,
      directory: Directory.Data,
    });

    return uriResult.uri;
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

    // Channel ကို Custom Sound နဲ့ ဖန်တီးမယ်
    try {
      const settings = getSettings();
      await LocalNotifications.createChannel({
        id: 'nexfix-reminders',
        name: 'NEXFIX Reminders',
        description: 'Task reminders from NEXFIX',
        importance: 5,
        visibility: 1,
        sound: settings.customSoundUri || undefined,
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
  const repeatMin = settings.repeatIntervalMinutes;

  if (Capacitor.isNativePlatform()) {
    try {
      // အဟောင်း ဖျက်မယ်
      const pending = await LocalNotifications.getPending();
      const existing = pending.notifications.filter(n => n.extra?.noteId === id);
      if (existing.length > 0) {
        await LocalNotifications.cancel({ notifications: existing });
      }

      // Repeat လုပ်မယ်ဆိုရင် (၅) ခု သတ်မှတ်မယ်
      const notificationsToSchedule = [];
      const repeatCount = repeatMin > 0 ? 5 : 1; // ၅ ခါ ထပ်ပို့မယ်
      
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
          sound: settings.customSoundUri || undefined,
          channelId: 'nexfix-reminders',
          extra: { 
            noteId: id,
            repeatIndex: i,
          }
        });
      }

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
        console.log(`${notificationsToSchedule.length} notifications scheduled`);
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
