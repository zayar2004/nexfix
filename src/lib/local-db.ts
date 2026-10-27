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
  checksum?: string;
};

const DB_NAME = "nexfix-local-v2";
const STORE_NAME = "sync-data";
const BACKUP_STORE = "sync-backup";
const DB_VERSION = 2;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      // Backup Store ဖန်တီး
      if (!db.objectStoreNames.contains(BACKUP_STORE)) {
        db.createObjectStore(BACKUP_STORE);
      }
    };
  });
}

// ============================================
// STORAGE QUOTA CHECK
// ============================================
export async function checkStorageQuota(): Promise<{
  available: number;
  used: number;
  percent: number;
}> {
  try {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { available: 0, used: 0, percent: 0 };
    }
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const available = estimate.quota || 0;
    const percent = available > 0 ? (used / available) * 100 : 0;
    return { available, used, percent };
  } catch {
    return { available: 0, used: 0, percent: 0 };
  }
}

// ============================================
// CHECKSUM (Client-Side Simple Hash)
// ============================================
function computeChecksum(data: unknown): string {
  try {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  } catch {
    return "";
  }
}

// ============================================
// SAVE / GET LOCAL DATA
// ============================================
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

// ============================================
// SAFE SAVE (Backup → Save → Verify)
// ============================================
export async function safeSaveLocalData(newData: SyncData): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    // 1. Storage Quota စစ်
    const quota = await checkStorageQuota();
    if (quota.available > 0 && quota.percent > 90) {
      return { ok: false, error: "Storage မလုံလောက်ပါ (90% ကျော်နေပါတယ်)" };
    }

    // 2. Old Data ကို Backup ယူ
    const oldData = await getLocalData();
    if (oldData) {
      await saveBackup(oldData);
    }

    // 3. New Data ကို Checksum ထည့်ပြီး Save
    const dataWithChecksum = {
      ...newData,
      checksum: computeChecksum({
        machines: newData.machines,
        errorCodes: newData.errorCodes,
        articles: newData.articles,
      }),
    };

    await saveLocalData(dataWithChecksum);

    // 4. Verify
    const verified = await getLocalData();
    if (!verified) {
      // 5. Fail ရင် Backup ကနေ ပြန်
      if (oldData) {
        await saveLocalData(oldData);
      }
      return { ok: false, error: "Save verification failed" };
    }

    return { ok: true };
  } catch (err) {
    console.error("Safe save error:", err);
    return { ok: false, error: String(err) };
  }
}

// ============================================
// BACKUP STORE
// ============================================
async function saveBackup(data: SyncData): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BACKUP_STORE, "readwrite");
    const store = tx.objectStore(BACKUP_STORE);
    const request = store.put(data, "backup-data");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getBackupData(): Promise<SyncData | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BACKUP_STORE, "readonly");
    const store = tx.objectStore(BACKUP_STORE);
    const request = store.get("backup-data");
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function restoreFromBackup(): Promise<boolean> {
  try {
    const backup = await getBackupData();
    if (!backup) return false;
    await saveLocalData(backup);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// CACHED DATA
// ============================================
let cachedData: SyncData | null = null;

export async function getCachedLocalData(): Promise<SyncData | null> {
  if (cachedData) return cachedData;
  const data = await getLocalData();
  cachedData = data;
  return cachedData;
}

// ============================================
// LOCAL SEARCH
// ============================================
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
  if (!data.machines || !data.errorCodes) return [];

  const cleanQuery = query.trim().toLowerCase();
  const cleanCode = errorCode.trim().toLowerCase();
  const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 0);
  const codeWords = cleanCode.split(/\s+/).filter(w => w.length > 0);

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

  const matchedErrors = data.errorCodes.filter((e) => {
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

// ============================================
// IMAGE CACHE
// ============================================
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
  if (url.startsWith("http")) return url;
  const s3Url = process.env.NEXT_PUBLIC_S3_URL || "";
  if (s3Url) return `${s3Url}/${url}`;
  return url;
}

// ============================================
// CLEAR LOCAL DATA
// ============================================
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

export async function savePrivateExcelData(rows: UserExcelRow[], userId: string): Promise<void> {
  const db = await getPrivateDB();
  const key = `excel-data-${userId}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PRIVATE_STORE_NAME, "readwrite");
    const store = tx.objectStore(PRIVATE_STORE_NAME);
    const request = store.put(rows, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getPrivateExcelData(userId: string): Promise<UserExcelRow[] | null> {
  const db = await getPrivateDB();
  const key = `excel-data-${userId}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PRIVATE_STORE_NAME, "readonly");
    const store = tx.objectStore(PRIVATE_STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function clearPrivateExcelData(userId: string): Promise<void> {
  const db = await getPrivateDB();
  const key = `excel-data-${userId}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PRIVATE_STORE_NAME, "readwrite");
    const store = tx.objectStore(PRIVATE_STORE_NAME);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function searchPrivateExcelData(query: string, userId: string): Promise<UserExcelRow[]> {
  if (!query.trim()) return [];
  const data = await getPrivateExcelData(userId);
  if (!data) return [];

  const lowerQuery = query.toLowerCase();
  return data.filter((row) => {
    return Object.values(row).some((value) =>
      String(value).toLowerCase().includes(lowerQuery)
    );
  });
}

// Legacy Functions (Migration အတွက်သာ)
export async function getLegacyExcelData(): Promise<UserExcelRow[] | null> {
  const db = await getPrivateDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PRIVATE_STORE_NAME, "readonly");
    const store = tx.objectStore(PRIVATE_STORE_NAME);
    const request = store.get("excel-data");
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function clearLegacyExcelData(): Promise<void> {
  const db = await getPrivateDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PRIVATE_STORE_NAME, "readwrite");
    const store = tx.objectStore(PRIVATE_STORE_NAME);
    const request = store.delete("excel-data");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// NOTES
// ============================================
export async function getLocalNotes(): Promise<Record<string, unknown>[]> {
  const data = await getCachedLocalData();
  return data?.notes || [];
}

export async function getLocalNote(id: string): Promise<Record<string, unknown> | null> {
  const notes = await getLocalNotes();
  return notes.find((n) => String(n.id) === id) || null;
}

// ============================================
// CHECK FOR UPDATES
// ============================================
export async function checkForUpdates(): Promise<boolean> {
  try {
    const localData = await getLocalData();
    if (!localData) return true;
    const lastSyncedAt = localData.lastSyncedAt || 0;
    const res = await fetch("/api/sync/version", { cache: "no-store" });
    const data = await res.json();
    if (!data.ok) return false;
    return data.lastUpdated > lastSyncedAt;
  } catch (err) {
    console.error("Check updates failed:", err);
    return false;
  }
}
