"use client";

export type SyncData = {
  machines: Record<string, unknown>[];
  errorCodes: Record<string, unknown>[];
  errorContents: Record<string, unknown>[];
  lastSyncedAt: number | null;
};

const DB_NAME = "nexfix-local";
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

export async function clearLocalData(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete("all-data");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// SEARCH FUNCTIONS (Local-First)
// ============================================

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
  const data = await getLocalData();
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

  if (matchedMachineIds.length === 0) return [];

  let matchedErrors = data.errorCodes.filter((e) => 
    matchedMachineIds.includes(String(e.machineId))
  );

  if (errorCode) {
    const lowerCode = errorCode.toLowerCase();
    const exactMatch = matchedErrors.filter((e) => 
      String(e.code).toLowerCase() === lowerCode
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
