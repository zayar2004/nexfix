"use client";

// ပုံတွေကို Cache Storage မှာ သိမ်းမယ်
const CACHE_NAME = "nexfix-images-v1";

export async function cacheImage(url: string): Promise<void> {
  if (!url || !url.startsWith("http")) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const existing = await cache.match(url);
    if (existing) return;
    const response = await fetch(url);
    if (!response.ok) return;
    await cache.put(url, response);
  } catch (err) {
    console.warn("Cache image failed:", url, err);
  }
}

export async function getCachedImage(url: string): Promise<string> {
  if (!url) return "";
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url);
    if (cached) {
      const blob = await cached.blob();
      return URL.createObjectURL(blob);
    }
  } catch { /* ignore */ }
  return url;
}

// တခြား ပုံတွေ အားလုံးကို Cache လုပ်မယ်
export async function cacheImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => cacheImage(url)));
}

// Cache ကို ရှင်းမယ်
export async function clearImageCache(): Promise<void> {
  try {
    await caches.delete(CACHE_NAME);
  } catch { /* ignore */ }
}
