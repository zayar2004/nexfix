"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { getLocalNotes } from "@/lib/local-db";
import { getOfflineNotes } from "@/lib/offline-queue";
import { Plus, Search, Clock, AlertTriangle, CheckCircle, ChevronRight, Trash2, Bell, Settings, MoreVertical, Copy, Pause, Play, SkipForward, Loader2, Calendar } from "lucide-react";

type Note = {
  id: string;
  title: string;
  body: string | null;
  reminderAt: string | null;
  priority: string;
  reminderEnabled: boolean;
  reminderStatus: string;
  isCompleted: boolean;
  nextReminderAt: string | null;
};

export default function NotesPage() {
  const router = useRouter();
  const { t, locale } = useSettings();
  const isMyanmar = locale === "my";

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "today" | "upcoming" | "overdue" | "completed">("all");
  const [counts, setCounts] = useState({ today: 0, upcoming: 0, overdue: 0, completed: 0 });
  
  // Actions Menu State
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      // ၁။ Local Storage ကနေ အရင်ဖတ်မယ်
      const localNotes = await getLocalNotes();
      const offlineNotes = getOfflineNotes();
      
      const allLocal = [...offlineNotes, ...localNotes];
      
      // Local Data ရှိရင် ချက်ချင်းပြမယ်၊ Loading ပိတ်မယ်
      if (allLocal.length > 0) {
        setNotes(allLocal as any);
        setLoading(false);
      }

      // ၂။ Offline ဖြစ်ရင် ဒီမှာတင် ရပ်မယ်
      if (!navigator.onLine) {
        setLoading(false);
        return;
      }

      // ၃။ Online ဖြစ်ရင် Server ကနေ Sync လုပ်မယ်
      try {
        const res = await fetch("/api/notes", { cache: "no-store" });
        const data = await res.json();
        if (data.ok) {
          setNotes(data.data);
        }
      } catch (err) {
        console.log("Server sync failed, using local");
      }
    } catch (err) {
      console.error(err);
    } finally {
      // ဘာပဲဖြစ်ဖြစ် Loading ပိတ်မယ်
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleAction = async (id: string, action: string) => {
    setMenuOpen(null);
    setActionLoading(id);
    try {
      if (action === "delete") {
        const target = notes.find(n => n.id === id);
        if (target) setDeleteTarget(target);
        setDeleteModalOpen(true);
        setActionLoading(null);
        return;
      }
      
      if (action === "duplicate") {
        const note = notes.find(n => n.id === id);
        if (note) {
          await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `${note.title} (Copy)`,
              body: note.body,
              priority: note.priority,
              reminderEnabled: note.reminderEnabled,
              reminderAt: note.reminderAt,
              reminderIntervalMinutes: 15,
              recurrence: "none",
            }),
          });
        }
      } else {
        // done, pause, resume, skip
        await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            ...(action === "done" && { isCompleted: true }),
            ...(action === "pause" && { reminderStatus: "paused" }),
            ...(action === "resume" && { reminderStatus: "pending" }),
            ...(action === "skip" && { reminderAt: null, reminderEnabled: false }),
          }),
        });
      }
      await fetchNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/notes?id=${deleteTarget.id}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await fetchNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filter === "completed") return n.isCompleted;
    if (n.isCompleted) return false;
    if (filter === "all") return true;
    if (filter === "today") {
      if (!n.reminderAt) return false;
      const d = new Date(n.reminderAt); const now = new Date();
      return d.toDateString() === now.toDateString() && d >= now;
    }
    if (filter === "upcoming") {
      if (!n.reminderAt) return true;
      return new Date(n.reminderAt) > new Date();
    }
    if (filter === "overdue") {
      if (!n.reminderAt) return false;
      return new Date(n.reminderAt) < new Date();
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
        <TopNav />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[var(--nx-cyan)] animate-spin" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{isMyanmar ? "ဖျက်ရန် သေချာပါသလား?" : "Delete Task?"}</h3>
            <p className="text-sm text-slate-400 mb-6">{deleteTarget?.title}</p>
            <div className="flex gap-3">
              <button onClick={() => { setDeleteModalOpen(false); setDeleteTarget(null); }} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/5">
                {isMyanmar ? "မလုပ်တော့ပါ" : "Cancel"}
              </button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-50">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isMyanmar ? "ဖျက်မည်" : "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{t("myTasks")}</h1>
            <p className="text-xs text-[var(--nx-text-muted-updated)]">
              {new Date().toLocaleDateString(isMyanmar ? "my-MM" : "en-US", { weekday: "short", month: "short", day: "numeric" })}
              {" • "}{notes.filter((n) => !n.isCompleted).length} {isMyanmar ? "လုပ်ငန်းများ" : "active"}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push("/notes/calendar")} className="p-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg text-white">
              <Calendar size={18} />
            </button>
            <button className="p-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg text-white">
              <Search size={18} />
            </button>
            <button onClick={() => router.push("/settings/reminders")} className="p-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg text-white">
              <Bell size={18} />
            </button>
            <button onClick={() => router.push("/settings/notifications")} className="p-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg text-white">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Summary Chips */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-center">
            <p className="text-xl font-bold text-[var(--nx-cyan)]">{counts.today}</p>
            <p className="text-[10px] text-[var(--nx-text-muted-updated)]">{t("today")}</p>
          </div>
          <div className="p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-center">
            <p className="text-xl font-bold text-blue-400">{counts.upcoming}</p>
            <p className="text-[10px] text-[var(--nx-text-muted-updated)]">{t("upcoming")}</p>
          </div>
          <div className="p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-center">
            <p className="text-xl font-bold text-red-400">{counts.overdue}</p>
            <p className="text-[10px] text-[var(--nx-text-muted-updated)]">{t("overdue")}</p>
          </div>
          <div className="p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-center">
            <p className="text-xl font-bold text-green-400">{counts.completed}</p>
            <p className="text-[10px] text-[var(--nx-text-muted-updated)]">{t("completed")}</p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          {(["all", "today", "upcoming", "overdue", "completed"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${filter === f ? "bg-[var(--nx-cyan)] text-black" : "bg-[var(--nx-bg-card)] text-[var(--nx-text-muted-updated)] border border-[var(--nx-border-updated)]"}`}>
              {t(f)}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nx-text-muted-updated)]" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isMyanmar ? "ရှာဖွေရန်..." : "Search..."}
            className="w-full bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-[var(--nx-cyan)] outline-none"
          />
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {filteredNotes.map((note) => (
            <div key={note.id} className="relative bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 flex items-center gap-3">
              <button onClick={() => handleAction(note.id, "done")} className="p-1 flex-shrink-0">
                <CheckCircle size={20} className={note.isCompleted ? "text-green-400" : "text-[var(--nx-text-muted-updated)]"} />
              </button>
              
              <div className="flex-1 min-w-0" onClick={() => router.push(`/notes/${note.id}`)}>
                <p className={`text-sm font-medium truncate ${note.isCompleted ? "text-[var(--nx-text-muted-updated)] line-through" : "text-white"}`}>
                  {note.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {note.reminderAt && (
                    <span className="text-[10px] text-[var(--nx-text-muted-updated)] flex items-center gap-1">
                      <Clock size={10} /> {new Date(note.reminderAt).toLocaleString(isMyanmar ? "my-MM" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${note.priority === "urgent" ? "bg-red-500/20 text-red-400" : note.priority === "high" ? "bg-orange-500/20 text-orange-400" : "bg-slate-500/20 text-slate-400"}`}>
                    {t(note.priority as any)}
                  </span>
                </div>
              </div>

              <button onClick={() => setMenuOpen(menuOpen === note.id ? null : note.id)} className="p-1.5 text-[var(--nx-text-muted-updated)] hover:bg-white/5 rounded flex-shrink-0">
                {actionLoading === note.id ? <Loader2 size={16} className="animate-spin" /> : <MoreVertical size={16} />}
              </button>

              {/* Actions Dropdown */}
              {menuOpen === note.id && (
                <div className="absolute right-2 top-12 z-40 w-44 bg-slate-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  <button onClick={() => { router.push(`/notes/${note.id}`); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white hover:bg-white/10">
                    <ChevronRight size={14} /> {isMyanmar ? "ကြည့်မည်" : "View"}
                  </button>
                  <button onClick={() => handleAction(note.id, "duplicate")} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white hover:bg-white/10">
                    <Copy size={14} /> {isMyanmar ? "ပွားမည်" : "Duplicate"}
                  </button>
                  {!note.isCompleted && note.reminderStatus !== "paused" && (
                    <button onClick={() => handleAction(note.id, "pause")} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white hover:bg-white/10">
                      <Pause size={14} /> {isMyanmar ? "ခဏရပ်မည်" : "Pause"}
                    </button>
                  )}
                  {note.reminderStatus === "paused" && (
                    <button onClick={() => handleAction(note.id, "resume")} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white hover:bg-white/10">
                      <Play size={14} /> {isMyanmar ? "ပြန်လုပ်မည်" : "Resume"}
                    </button>
                  )}
                  <button onClick={() => handleAction(note.id, "skip")} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white hover:bg-white/10">
                    <SkipForward size={14} /> {isMyanmar ? "ကျော်မည်" : "Skip"}
                  </button>
                  <button onClick={() => handleAction(note.id, "delete")} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 border-t border-white/5">
                    <Trash2 size={14} /> {isMyanmar ? "ဖျက်မည်" : "Delete"}
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <div className="text-center py-12 text-[var(--nx-text-muted-updated)]">
              <p className="text-sm">{isMyanmar ? "လုပ်ငန်း မရှိပါ" : "No tasks yet"}</p>
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        <button
          onClick={() => router.push("/notes/add")}
          className="fixed bottom-20 right-5 z-30 w-14 h-14 rounded-full bg-[var(--nx-cyan)] text-black shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition"
        >
          <Plus size={28} />
        </button>
      </main>
      <BottomNav />
    </div>
  );
}
