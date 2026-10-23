"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, Pause, Play, SkipForward, MoreVertical, Bell } from "lucide-react";

type Note = {
  id: string;
  title: string;
  body: string | null;
  reminderAt: string | null;
  recurrence: string | null;
  priority: string;
  reminderEnabled: boolean;
  reminderIntervalMinutes: string;
  reminderStatus: string;
  nextReminderAt: string | null;
  isCompleted: boolean;
  createdAt: string;
};

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t, locale } = useSettings();
  const isMyanmar = locale === "my";
  const { id } = use(params);

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchNote = async () => {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (data.ok) {
        const target = data.data.find((n: Note) => n.id === id);
        setNote(target || null);
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

  const handleAction = async (action: string) => {
    if (!note) return;
    try {
      let body: any = { id: note.id };
      if (action === "done") {
        body = { ...body, isCompleted: true, reminderStatus: "done", completedAt: new Date().toISOString() };
      } else if (action === "pause") {
        body = { ...body, reminderStatus: "paused" };
      } else if (action === "resume") {
        body = { ...body, reminderStatus: "pending" };
      } else if (action === "skip") {
        body = { ...body, reminderStatus: "skipped" };
      }
      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      fetchNote();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/15 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      case "low": return "bg-gray-500/15 text-gray-400 border-gray-500/30";
      default: return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    }
  };

  if (loading) {
  
  const DeleteModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          {isMyanmar ? "ဖျက်ရန် သေချာပါသလား?" : "Delete Task?"}
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          {isMyanmar 
            ? "ဤလုပ်ငန်းကို ဖျက်လိုက်ပါက ပြန်လည် ရယူနိုင်မည် မဟုတ်ပါ။" 
            : "This action cannot be undone."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition border border-white/5"
          >
            {isMyanmar ? "မလုပ်တော့ပါ" : "Cancel"}
          </button>
          <button
            onClick={confirmDelete}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition shadow-lg shadow-red-600/20"
          >
            {isMyanmar ? "ဖျက်မည်" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
      <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
        <TopNav />
        <div className="flex items-center justify-center py-20">
          <p className="text-white">Loading...</p>
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
      {deleteModalOpen && <DeleteModal />}
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-2">
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
            {note.isCompleted ? t("done") : t(note.reminderStatus as any)}
          </span>
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-bold mb-3 ${note.isCompleted ? "line-through text-[var(--nx-text-muted-updated)]" : "text-white"}`}>
          {note.title}
        </h1>

        {/* Body */}
        {note.body && (
          <p className="text-sm text-[var(--nx-text-secondary-updated)] leading-relaxed mb-4 whitespace-pre-line">
            {note.body}
          </p>
        )}

        {/* Info Card */}
        <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl mb-4 flex flex-col gap-3">
          {note.reminderAt && (
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-[var(--nx-cyan)]" />
              <div>
                <p className="text-[10px] text-[var(--nx-text-muted-updated)] uppercase">{t("reminderTime")}</p>
                <p className="text-sm text-white">
                  {new Date(note.reminderAt).toLocaleString(isMyanmar ? "my-MM" : "en-US", {
                    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
          )}
          {note.reminderEnabled && (
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-[var(--nx-cyan)]" />
              <div>
                <p className="text-[10px] text-[var(--nx-text-muted-updated)] uppercase">{t("reminderInterval")}</p>
                <p className="text-sm text-white">{note.reminderIntervalMinutes} {t("minutes")}</p>
              </div>
            </div>
          )}
          {note.recurrence && note.recurrence !== "none" && (
            <div className="flex items-center gap-3">
              <SkipForward size={18} className="text-[var(--nx-cyan)]" />
              <div>
                <p className="text-[10px] text-[var(--nx-text-muted-updated)] uppercase">{t("recurrence")}</p>
                <p className="text-sm text-white">{t(note.recurrence as any)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {!note.isCompleted && (
            <button onClick={() => handleAction("done")} className="w-full py-3 bg-green-500 text-white font-bold rounded-lg flex items-center justify-center gap-2">
              <CheckCircle size={18} /> {t("markDone")}
            </button>
          )}
          {note.reminderStatus === "pending" && !note.isCompleted && (
            <button onClick={() => handleAction("pause")} className="w-full py-3 bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] font-bold rounded-lg flex items-center justify-center gap-2">
              <Pause size={18} /> {t("pause")}
            </button>
          )}
          {note.reminderStatus === "paused" && (
            <button onClick={() => handleAction("resume")} className="w-full py-3 bg-[var(--nx-cyan)] text-black font-bold rounded-lg flex items-center justify-center gap-2">
              <Play size={18} /> {t("resume")}
            </button>
          )}
          {!note.isCompleted && note.reminderStatus !== "skipped" && (
            <button onClick={() => handleAction("skip")} className="w-full py-3 bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] font-bold rounded-lg flex items-center justify-center gap-2">
              <SkipForward size={18} /> {t("skip")}
            </button>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
