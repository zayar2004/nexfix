"use client";

// Offline Action တွေကို Queue မှာ သိမ်းမယ်
export type OfflineAction = {
  id: string;
  type: "create" | "update" | "delete";
  resource: "note";
  payload: any;
  createdAt: number;
};

const QUEUE_KEY = "nexfix-offline-queue";

export function getQueue(): OfflineAction[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(QUEUE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch { /* ignore */ }
  }
  return [];
}

export function saveQueue(queue: OfflineAction[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function addToQueue(action: Omit<OfflineAction, "id" | "createdAt">) {
  const queue = getQueue();
  const newAction: OfflineAction = {
    ...action,
    id: `action-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
  };
  queue.push(newAction);
  saveQueue(queue);
  return newAction;
}

export function removeFromQueue(id: string) {
  const queue = getQueue().filter((a) => a.id !== id);
  saveQueue(queue);
}

export function clearQueue() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
}

// Offline မှာ ဖန်တီးထားတဲ့ Note တွေကို Local Storage မှာ သိမ်းမယ်
const OFFLINE_NOTES_KEY = "nexfix-offline-notes";

export function getOfflineNotes(): any[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(OFFLINE_NOTES_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch { /* ignore */ }
  }
  return [];
}

export function saveOfflineNote(note: any) {
  if (typeof window === "undefined") return;
  const notes = getOfflineNotes();
  const existingIndex = notes.findIndex((n) => n.id === note.id);
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.push(note);
  }
  localStorage.setItem(OFFLINE_NOTES_KEY, JSON.stringify(notes));
}

export function removeOfflineNote(id: string) {
  if (typeof window === "undefined") return;
  const notes = getOfflineNotes().filter((n) => n.id !== id);
  localStorage.setItem(OFFLINE_NOTES_KEY, JSON.stringify(notes));
}

export function clearOfflineNotes() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OFFLINE_NOTES_KEY);
}
