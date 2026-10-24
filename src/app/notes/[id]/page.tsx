"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { scheduleNotification, cancelNotification } from "@/lib/notifications";
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, Pause, Play, SkipForward, Bell, History } from "lucide-react";

type Note = {
  id: string;
  title: string;
  body: string | null;
  reminderAt: string | null;
  recurrence: string | null;
  priority: string;
  reminderEnabled: boolean;
  reminderIntervalMinutes: string;
  imageUrls?: string[];
  reminderStatus: string;
  nextReminderAt: string | null;
  isCompleted: boolean;
};

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t, locale } = useSettings();
  const isMyanmar = locale === "my";

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [snoozeModalOpen, setSnoozeModalOpen] = useState(false);
  const [snoozeSaving, setSnoozeSaving] = useState(false);

  const fetchNote = async () => {
    try {
      const res = await fetch(`/api/notes/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (data.ok && data.data) {
        setNote(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [id]);

  // ==== Actions ====
  const handleDelete = () => {
    if (!note) return;
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!note) return;
    setDeleteModalOpen(false);
    try {
      await fetch(`/api/notes?id=${note.id}`, { method: "DELETE" });
      router.push("/notes");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSnooze = async (minutes: number) => {
    if (!note) return;
    setSnoozeSaving(true);
    try {
      const newTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderEnabled: true,
          reminderAt: newTime,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSnoozeModalOpen(false);
        await fetchNote(); // Data ကို ချက်ချင်း ပြန်ယူမယ်
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSnoozeSaving(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!note) return;
    try {
      const res = await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: note.id,
          ...(action === "done" && { isCompleted: true }),
          ...(action === "pause" && { reminderStatus: "paused" }),
          ...(action === "resume" && { reminderStatus: "pending" }),
          ...(action === "skip" && { reminderAt: null, reminderEnabled: false }),
        }),
      });
      if (res.ok) {
        // Done/Pause/Skip လုပ်ရင် Notification ကို ဖျက်မယ်
        await cancelNotification(note.id);
        fetchNote();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/15 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      case "low": return "bg-gray-500/15 text-gray-400 border-gray-500/30";
      default: return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
        <TopNav />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--nx-cyan)] border-t-transparent animate-spin" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
        <TopNav />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <p className="text-white mb-4">{isMyanmar ? "လုပ်ငန်း မတွေ့ပါ" : "Task not found"}</p>
          <button onClick={() => router.push("/notes")} className="px-4 py-2 bg-[var(--nx-cyan)] text-black rounded-lg font-bold">
            {isMyanmar ? "ပြန်သွား" : "Go Back"}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      {/* === Delete Modal === */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{isMyanmar ? "ဖျက်ရန် သေချာပါသလား?" : "Delete Task?"}</h3>
            <p className="text-sm text-slate-400 mb-6">{isMyanmar ? "ဤလုပ်ငန်းကို ဖျက်လိုက်ပါက ပြန်လည် ရယူနိုင်မည် မဟုတ်ပါ။" : "This action cannot be undone."}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/5">{isMyanmar ? "မလုပ်တော့ပါ" : "Cancel"}</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium shadow-lg shadow-red-600/20">{isMyanmar ? "ဖျက်မည်" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

      {/* === Snooze Modal === */}
      {snoozeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{isMyanmar ? "ခဏရွှေ့ထားမည်" : "Snooze Task"}</h3>
            <p className="text-sm text-slate-400 mb-5">{isMyanmar ? "ဘယ်လောက်ကြာကြာ ရွှေ့ထားမလဲ?" : "How long do you want to snooze?"}</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[5, 10, 15, 30].map((min) => (
                <button key={min} onClick={() => handleSnooze(min)} disabled={snoozeSaving} className="py-3 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-white font-medium transition">
                  {min} {isMyanmar ? "မိနစ်" : "min"}
                </button>
              ))}
            </div>
            <button onClick={() => setSnoozeModalOpen(false)} className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5">
              {isMyanmar ? "မလုပ်တော့ပါ" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button onClick={() => setSnoozeModalOpen(true)} className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Clock size={18} />
            </button>
            <button onClick={() => router.push(`/notes/${note.id}/history`)} className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
              <History size={18} />
            </button>
            <button onClick={() => router.push(`/notes/add?edit=${note.id}`)} className="p-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg text-white">
              <Edit size={18} />
            </button>
            <button onClick={handleDelete} className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Status & Priority */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(note.priority)}`}>
            {t(note.priority as any)}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            note.isCompleted ? "bg-green-500/15 text-green-400 border-green-500/30" :
            note.reminderStatus === "paused" ? "bg-gray-500/15 text-gray-400 border-gray-500/30" :
            "bg-blue-500/15 text-blue-400 border-blue-500/30"
          }`}>
            {note.isCompleted ? t("completed" as any) : note.reminderStatus === "paused" ? t("paused" as any) : t("pending" as any)}
          </span>
        </div>

        {/* Title & Body */}
        <h1 className="text-3xl font-bold text-white mb-2">{note.title}</h1>

        {note.imageUrls && note.imageUrls.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-2">
            {note.imageUrls.map((url: string, idx: number) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-[var(--nx-border-updated)]">
                <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
    
        {note.body && <p className="text-[var(--nx-text-muted-updated)] mb-4">{note.body}</p>}

        {/* Info Card */}
        <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6 flex flex-col gap-3">
          {note.reminderAt && (
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-[var(--nx-cyan)] mt-0.5" />
              <div>
                <p className="text-[10px] text-[var(--nx-text-muted-updated)] uppercase font-bold">{t("reminderTime" as any)}</p>
                <p className="text-white text-sm">{new Date(note.reminderAt).toLocaleString(isMyanmar ? "my-MM" : "en-US")}</p>
              </div>
            </div>
          )}
          {note.reminderEnabled && (
            <div className="flex items-start gap-3">
              <Bell size={18} className="text-[var(--nx-cyan)] mt-0.5" />
              <div>
                <p className="text-[10px] text-[var(--nx-text-muted-updated)] uppercase font-bold">{t("reminderInterval" as any)}</p>
                <p className="text-white text-sm">{note.reminderIntervalMinutes} {t("minutes" as any)}</p>
              </div>
            </div>
          )}
          {note.recurrence && note.recurrence !== "none" && (
            <div className="flex items-start gap-3">
              <SkipForward size={18} className="text-[var(--nx-cyan)] mt-0.5" />
              <div>
                <p className="text-[10px] text-[var(--nx-text-muted-updated)] uppercase font-bold">{t("recurrence" as any)}</p>
                <p className="text-white text-sm capitalize">{t(note.recurrence as any)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {!note.isCompleted && (
            <button onClick={() => handleAction("done")} className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition">
              <CheckCircle size={20} /> {t("markDone" as any)}
            </button>
          )}
          {note.reminderStatus !== "paused" ? (
            <button onClick={() => handleAction("pause")} className="w-full flex items-center justify-center gap-2 bg-[var(--nx-bg-card)] hover:bg-[var(--nx-border-updated)] border border-[var(--nx-border-updated)] text-white font-medium py-3 rounded-xl transition">
              <Pause size={20} /> {t("pause" as any)}
            </button>
          ) : (
            <button onClick={() => handleAction("resume")} className="w-full flex items-center justify-center gap-2 bg-[var(--nx-bg-card)] hover:bg-[var(--nx-border-updated)] border border-[var(--nx-border-updated)] text-white font-medium py-3 rounded-xl transition">
              <Play size={20} /> {t("resume" as any)}
            </button>
          )}
          <button onClick={() => handleAction("skip")} className="w-full flex items-center justify-center gap-2 bg-[var(--nx-bg-card)] hover:bg-[var(--nx-border-updated)] border border-[var(--nx-border-updated)] text-white font-medium py-3 rounded-xl transition">
            <SkipForward size={20} /> {t("skip" as any)}
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
