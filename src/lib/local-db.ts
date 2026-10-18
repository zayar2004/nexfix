"use client";

export type SyncData = {
  machines: Record<string, unknown>[];
  errorCodes: Record<string, unknown>[];
  errorContents: Record<string, unknown>[];
  articles: Record<string, unknown>[];
  articleContents: Record<string, unknown>[];
  media?: Record<string, unknown>[];
  mediaVideos?: Record<string, unknown>[];
  lastSyncedAt: number | null;
  homepage?: Record<string, unknown>;
};

const DB_NAME = "nexfix-local-v2"; // Version တင်လိုက်တယ်
const STORE_NAME = "sync-data";

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveLocalData(data: SyncData): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(data, "all-data");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalData(): Promise<SyncData | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get("all-data");
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

// ဒီ Function ကို သုံးပြီး Data တွေကို Memory ထဲမှာ ခဏသိမ်းထားမယ် (Cache လုပ်မယ်)
let cachedData: SyncData | null = null;

export async function getCachedLocalData(): Promise<SyncData | null> {
  if (cachedData) return cachedData; // Memory ထဲမှာရှိရင် ချက်ချင်းပြန်ပေးမယ်
  const data = await getLocalData();
  cachedData = data;
  return data;
}

export type LocalSearchResult = {
  id: string;
  code: string;
  title: string;
  machineName: string;
  machineCode: string;
  solution: string | null;
};

export async function searchLocalData(
  machineName: string,
  errorCode: string
): Promise<LocalSearchResult[]> {
  const data = await getCachedLocalData(); // Cache ကနေ ယူမယ်
  if (!data) return [];

  let matchedMachineIds: string[] = [];
  if (machineName) {
    const lowerMachine = machineName.toLowerCase();
    matchedMachineIds = data.machines
      .filter((m) => String(m.name).toLowerCase().includes(lowerMachine))
      .map((m) => String(m.id));
  } else {
    matchedMachineIds = data.machines.map((m) => String(m.id));
  }

  if (matchedMachineIds.length === 0 && machineName) return [];

  let matchedErrors = data.errorCodes.filter((e) =>
    matchedMachineIds.length > 0 ? matchedMachineIds.includes(String(e.machineId)) : true
  );

  if (errorCode) {
    const lowerCode = errorCode.toLowerCase();
    const exactMatch = matchedErrors.filter(
      (e) => String(e.code).toLowerCase() === lowerCode
    );

    if (exactMatch.length > 0) {
      matchedErrors = exactMatch;
    } else {
      matchedErrors = matchedErrors.filter((e) =>
        String(e.code).toLowerCase().includes(lowerCode)
      );
    }
  }

  return matchedErrors.map((e) => {
    const machine = data.machines.find((m) => m.id === e.machineId);
    const contents = data.errorContents.filter((c) => c.errorCodeId === e.id);
    const myContent = contents.find((c) => c.locale === "my");
    const enContent = contents.find((c) => c.locale === "en");
    const content = myContent || enContent || null;

    return {
      id: String(e.id),
      code: String(e.code),
      title: String(e.title),
      machineName: String(machine?.name || "Unknown"),
      machineCode: String(machine?.code || "Unknown"),
      solution: content ? String(content.solution) : null,
    };
  });
}

// ပုံတွေကို Cache လုပ်မယ်
export async function cacheImage(url: string): Promise<void> {
  if (!url) return;
  try {
    const cache = await caches.open("nexfix-images");
    const existing = await cache.match(url);
    if (existing) return;
    const response = await fetch(url);
    if (!response.ok) return;
    await cache.put(url, response);
  } catch {
    console.warn("Failed to cache image:", url);
  }
}

export async function getCachedImageUrl(url: string): Promise<string> {
  if (!url) return "";
  try {
    const cache = await caches.open("nexfix-images");
    const response = await cache.match(url);
    if (response) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    return url;
  } catch {
    return url;
  }
}

export async function clearLocalData(): Promise<void> {
  const db = await getDB();
  cachedData = null; // Cache ကိုပါ ရှင်းမယ်
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete("all-data");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
