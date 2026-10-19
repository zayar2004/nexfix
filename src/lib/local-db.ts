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
  return data;
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

// 🌟 App Data နဲ့ Excel Data ကို ရောပြီး ရှာမယ့် Function
export async function searchLocalData(
  query: string,
  errorCode: string = ""
): Promise<LocalSearchResult[]> {
  const data = await getCachedLocalData();
  const userData = await getPrivateExcelData(); // Excel Data ကိုပါ ယူမယ်
  
  let appResults: LocalSearchResult[] = [];
  let excelResults: LocalSearchResult[] = [];

  const lowerQuery = query.toLowerCase();

  // ၁။ App ရဲ့ Default Data ကို ရှာမယ်
  if (data && query) {
    let matchedErrors = data.errorCodes;
    matchedErrors = matchedErrors.filter((e) => {
      const machine = data.machines.find((m) => m.id === e.machineId);
      const mName = String(machine?.name || "").toLowerCase();
      const eCode = String(e.code || "").toLowerCase();
      const eTitle = String(e.title || "").toLowerCase();
      return mName.includes(lowerQuery) || eCode.includes(lowerQuery) || eTitle.includes(lowerQuery);
    });

    appResults = matchedErrors.map((e) => {
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
        isFromExcel: false,
      };
    });
  }

  // ၂။ Excel Data ကို ရှာမယ်
  if (userData && query) {
    excelResults = userData
      .filter(row => 
        row.machineName.toLowerCase().includes(lowerQuery)
      )
      .map((row, idx) => ({
        id: `excel-${idx}`,
        code: row.errorCode, 
        title: row.errorFix, 
        machineName: row.machineName, 
        machineCode: row.machineName,
        solution: row.errorFix,
        isFromExcel: true,
      }));
  }

  // Exact Match ကို အပေါ်ဆုံးထားမယ်
  const allResults = [...appResults, ...excelResults];
  const exactMatches = allResults.filter(r => r.machineName.toLowerCase() === lowerQuery || r.code.toLowerCase() === lowerQuery);
  const otherMatches = allResults.filter(r => r.machineName.toLowerCase() !== lowerQuery && r.code.toLowerCase() !== lowerQuery);

  return [...exactMatches, ...otherMatches];
}

export async function cacheImage(url: string): Promise<void> {
  if (!url) return;
  try {
    const cache = await caches.open("nexfix-images");
    const existing = await cache.match(url);
    if (existing) return;
    const response = await fetch(url);
    if (!response.ok) return;
    await cache.put(url, response);
  } catch {}
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
  } catch { return url; }
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
  machineName: string; // Machine Code
  errorCode: string;   // Arrival Date
  errorFix: string;    // Location
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
