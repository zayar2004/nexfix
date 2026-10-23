import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Notification ပို့ဖို့ ခွင့်ပြုချက် (Permission) တောင်းမယ်
export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === 'granted';
  } else {
    if (!("Notification" in window)) return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
}

// Notification အချိန်သတ်မှတ်မယ် (Schedule)
export async function scheduleNotification(id: string, title: string, body: string, date: Date) {
  if (date.getTime() <= Date.now()) return;

  if (Capacitor.isNativePlatform()) {
    // 📱 Android App အတွက် (Native Local Notification)
    try {
      const pending = await LocalNotifications.getPending();
      // အရင်က သတ်မှတ်ထားတဲ့ Notification တွေ ရှိရင် အရင်ဖျက်မယ်
      const existing = pending.notifications.filter(n => n.extra?.noteId === id);
      if (existing.length > 0) {
        await LocalNotifications.cancel({ notifications: existing });
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: date, allowWhileIdle: true }, // allowWhileIdle က ဖုန်း sleep ဖြစ်နေရင်လည်း အလုပ်လုပ်အောင် လုပ်ပေးတယ်
            sound: undefined,
            extra: { noteId: id }
          }
        ]
      });
      console.log("Native Notification Scheduled for:", date);
    } catch (e) {
      console.error("Native Notif Error", e);
    }
  } else {
    // 💻 Web Browser အတွက် (Service Worker မှတဆင့်)
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
      console.log("Web Notification Scheduled");
    }
  }
}

// Notification ကို ပြန်ဖျက်မယ် (Note ကို Done/Delete လုပ်ရင်)
export async function cancelNotification(noteId: string) {
  if (Capacitor.isNativePlatform()) {
    try {
      const pending = await LocalNotifications.getPending();
      const toCancel = pending.notifications.filter(n => n.extra?.noteId === noteId);
      if (toCancel.length > 0) {
        await LocalNotifications.cancel({ notifications: toCancel });
        console.log("Notification Cancelled");
      }
    } catch (e) {
      console.error("Cancel Notif Error", e);
    }
  }
}
