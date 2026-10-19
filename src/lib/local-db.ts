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
  lastUpdated?: number;
  homepage?: Record<string, unknown>;
};

const DB_NAME = "nexfix-local-v2";
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

let cachedData: SyncData | null = null;

export async function getCachedLocalData(): Promise<SyncData | null> {
  if (cachedData) return cachedData;
  const data = await getLocalData();
  cachedData = data;
  return cachedData;
}

export type LocalSearchResult = {
  id: string;
  code: string;
  title: string;
  machineName: string;
  machineCode: string;
  solution: string | null;
  isFromExcel?: boolean;
};

export async function searchLocalData(
  query: string,
  errorCode: string = ""
): Promise<LocalSearchResult[]> {
  const data = await getCachedLocalData();
  if (!data) return [];

  let matchedErrors = data.errorCodes;

  if (query) {
    const lowerQuery = query.toLowerCase();
    matchedErrors = matchedErrors.filter((e) => {
      const machine = data.machines.find((m) => m.id === e.machineId);
      const mName = String(machine?.name || "").toLowerCase();
      const eCode = String(e.code || "").toLowerCase();
      const eTitle = String(e.title || "").toLowerCase();
      return mName.includes(lowerQuery) || eCode.includes(lowerQuery) || eTitle.includes(lowerQuery);
    });
  }

  if (query) {
    const exactCodeMatch = matchedErrors.filter(e => String(e.code).toLowerCase() === query.toLowerCase());
    if (exactCodeMatch.length > 0) {
      matchedErrors = [...exactCodeMatch, ...matchedErrors.filter(e => String(e.code).toLowerCase() !== query.toLowerCase())];
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

// 🌟 Image Caching ကို ပြင်မယ်
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
  // 🌟 URL က http နဲ့ စရင် တိုက်ရိုက် ပြန်ပေးမယ်
  if (url.startsWith("http")) {
    return url;
  }
  // 🌟 မဟုတ်ရင် S3 URL နဲ့ ချိတ်မယ်
  const s3Url = process.env.NEXT_PUBLIC_S3_URL || "";
  if (s3Url) return `${s3Url}/${url}`;
  return url;
}

export async function clearLocalData(): Promise<void> {
  const db = await getDB();
  cachedData = null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete("all-data");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// PRIVATE USER MACHINE CODES (Excel Data)
// ============================================
const PRIVATE_DB_NAME = "nexfix-private-codes";
const PRIVATE_STORE_NAME = "user-excel";

function getPrivateDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PRIVATE_DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PRIVATE_STORE_NAME)) {
        db.createObjectStore(PRIVATE_STORE_NAME);
      }
    };
  });
}

export type UserExcelRow = {
  machineName: string;
  errorCode: string;
  errorFix: string;
};

export async function savePrivateExcelData(rows: UserExcelRow[]): Promise<void> {
  const db = await getPrivateDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PRIVATE_STORE_NAME, "readwrite");
    const store = tx.objectStore(PRIVATE_STORE_NAME);
    const request = store.put(rows, "excel-data");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getPrivateExcelData(): Promise<UserExcelRow[] | null> {
  const db = await getPrivateDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PRIVATE_STORE_NAME, "readonly");
    const store = tx.objectStore(PRIVATE_STORE_NAME);
    const request = store.get("excel-data");
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function clearPrivateExcelData(): Promise<void> {
  const db = await getPrivateDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PRIVATE_STORE_NAME, "readwrite");
    const store = tx.objectStore(PRIVATE_STORE_NAME);
    const request = store.delete("excel-data");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
