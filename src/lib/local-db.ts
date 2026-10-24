"use client";

export type SyncData = {
  machines: Record<string, unknown>[];
  errorCodes: Record<string, unknown>[];
  errorContents: Record<string, unknown>[];
  articles: Record<string, unknown>[];
  articleContents: Record<string, unknown>[];
  media?: Record<string, unknown>[];
  mediaVideos?: Record<string, unknown>[];
  notes?: Record<string, unknown>[];
  lastSyncedAt: number | null;
  lastUpdated?: number;
  homepage?: Record<string, unknown>;
  stats?: { totalErrors: number; totalMachines: number; totalArticles: number };
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

  // 🌟 ရှာတဲ့စာသားကို သန့်ရှင်းအောင် လုပ်မယ်
  const cleanQuery = query.trim().toLowerCase();
  const cleanCode = errorCode.trim().toLowerCase();
  
  // 🌟 စာသားကို စကားလုံးတွေအဖြစ် ခွဲမယ် (Multiple Keywords အတွက်)
  const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 0);
  const codeWords = cleanCode.split(/\s+/).filter(w => w.length > 0);

  // 🌟 Machine ID တွေကို ရှာမယ်
  let matchedMachineIds: string[] = [];
  
  if (queryWords.length > 0) {
    const exactMatch = data.machines.filter((m) => {
      const mName = String(m.name).toLowerCase();
      return queryWords.every(word => mName.includes(word));
    });
    
    if (exactMatch.length > 0) {
      matchedMachineIds = exactMatch.map(m => String(m.id));
    } else {
      matchedMachineIds = data.machines
        .filter((m) => {
          const mName = String(m.name).toLowerCase();
          return queryWords.some(word => mName.includes(word));
        })
        .map(m => String(m.id));
    }
  } else {
    matchedMachineIds = data.machines.map(m => String(m.id));
  }

  // 🌟 Error Code တွေကို ရှာမယ်
  let matchedErrors = data.errorCodes.filter((e) => {
    if (queryWords.length > 0 && matchedMachineIds.length > 0) {
      if (!matchedMachineIds.includes(String(e.machineId))) return false;
    }
    
    if (codeWords.length > 0) {
      const eCode = String(e.code).toLowerCase();
      return codeWords.every(word => eCode.includes(word));
    }
    
    if (queryWords.length > 0) {
      const eTitle = String(e.title).toLowerCase();
      return queryWords.some(word => eTitle.includes(word));
    }
    
    return true;
  });

  // 🌟 Ranking လုပ်မယ်
  const rankedResults = matchedErrors.map((e) => {
    const eCode = String(e.code).toLowerCase();
    const eTitle = String(e.title).toLowerCase();
    const machine = data.machines.find((m) => m.id === e.machineId);
    const mName = String(machine?.name || "").toLowerCase();
    
    let score = 0;
    
    if (cleanCode && eCode === cleanCode) score += 100;
    if (cleanQuery && eCode === cleanQuery) score += 100;
    if (cleanCode && eCode.startsWith(cleanCode)) score += 50;
    if (cleanQuery && eCode.startsWith(cleanQuery)) score += 50;
    if (cleanQuery && eTitle === cleanQuery) score += 80;
    if (cleanQuery && eTitle.startsWith(cleanQuery)) score += 40;
    if (cleanQuery && mName === cleanQuery) score += 70;
    if (cleanQuery && mName.startsWith(cleanQuery)) score += 30;
    if (queryWords.length > 0 && queryWords.every(w => eTitle.includes(w))) score += 20;
    if (queryWords.length > 0 && queryWords.every(w => mName.includes(w))) score += 20;
    score -= eCode.length * 0.1;
    
    return { error: e, score };
  });

  rankedResults.sort((a, b) => b.score - a.score);

  return rankedResults.map(({ error: e }) => {
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

// ----------------------------------------
// SEARCH PRIVATE EXCEL DATA
// ----------------------------------------
export async function searchPrivateExcelData(query: string): Promise<UserExcelRow[]> {
  if (!query.trim()) return [];
  const data = await getPrivateExcelData();
  if (!data) return [];

  const lowerQuery = query.toLowerCase();
  
  // Filter rows where any field matches the query
  return data.filter((row) => {
    return Object.values(row).some((value) => 
      String(value).toLowerCase().includes(lowerQuery)
    );
  });
}


// Notes ကို Local Storage ကနေ ရှာမယ်
export async function getLocalNotes(): Promise<Record<string, unknown>[]> {
  const data = await getCachedLocalData();
  return data?.notes || [];
}

// Note တစ်ခုကို Local Storage ကနေ ယူမယ်
export async function getLocalNote(id: string): Promise<Record<string, unknown> | null> {
  const notes = await getLocalNotes();
  return notes.find((n) => String(n.id) === id) || null;
}


// Admin Update အသစ် ရှိမရှိ စစ်မယ်
export async function checkForUpdates(): Promise<boolean> {
  try {
    const localData = await getLocalData();
    if (!localData) return true; // Local Data မရှိရင် Update လိုတယ်
    
    // နောက်ဆုံး Sync လုပ်ထားတဲ့ Timestamp ကို ယူမယ်
    const lastSyncedAt = localData.lastSyncedAt || 0;
    
    // Server ကို ခေါ်ပြီး Version စစ်မယ်
    const res = await fetch("/api/sync/version", { cache: "no-store" });
    const data = await res.json();
    
    if (!data.ok) return false;
    
    // Server ရဲ့ lastUpdated က Local ထက် ပိုအသစ်ရင် Update လိုတယ်
    return data.lastUpdated > lastSyncedAt;
  } catch (err) {
    console.error("Check updates failed:", err);
    return false;
  }
}

