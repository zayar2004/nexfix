"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { Plus, Search, Calendar, Clock, AlertTriangle, CheckCircle, Pause, ChevronRight, Trash2, Bell } from "lucide-react";

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

type Filter = "all" | "today" | "upcoming" | "overdue" | "completed";

export default function NotesPage() {
  const router = useRouter();
  const { t, locale } = useSettings();
  const isMyanmar = locale === "my";

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (data.ok) setNotes(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDone = async (id: string) => {
    try {
      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isCompleted: true,
          reminderStatus: "done",
          completedAt: new Date().toISOString(),
        }),
      });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredNotes = useMemo(() => {
    let result = notes;
    const now = new Date();

    if (filter === "today") {
      result = result.filter((n) => {
        if (!n.reminderAt) return false;
        const d = new Date(n.reminderAt);
        return d.toDateString() === now.toDateString() && !n.isCompleted;
      });
    } else if (filter === "upcoming") {
      result = result.filter((n) => n.reminderAt && new Date(n.reminderAt) > now && !n.isCompleted);
    } else if (filter === "overdue") {
      result = result.filter((n) => n.reminderAt && new Date(n.reminderAt) < now && !n.isCompleted);
    } else if (filter === "completed") {
      result = result.filter((n) => n.isCompleted);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        (n.body && n.body.toLowerCase().includes(q))
      );
    }

    return result;
  }, [notes, filter, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    const now = new Date();
    return {
      today: notes.filter((n) => n.reminderAt && new Date(n.reminderAt).toDateString() === now.toDateString() && !n.isCompleted).length,
      upcoming: notes.filter((n) => n.reminderAt && new Date(n.reminderAt) > now && !n.isCompleted).length,
      overdue: notes.filter((n) => n.reminderAt && new Date(n.reminderAt) < now && !n.isCompleted).length,
      completed: notes.filter((n) => n.isCompleted).length,
    };
  }, [notes]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/15 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      case "low": return "bg-gray-500/15 text-gray-400 border-gray-500/30";
      default: return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    }
  };

  const getStatusBadge = (note: Note) => {
    if (note.isCompleted) return { text: isMyanmar ? "ပြီးစီး" : "Done", color: "bg-green-500/15 text-green-400 border-green-500/30" };
    if (note.reminderStatus === "paused") return { text: isMyanmar ? "ရပ်ထား" : "Paused", color: "bg-gray-500/15 text-gray-400 border-gray-500/30" };
    if (note.reminderAt && new Date(note.reminderAt) < new Date()) return { text: isMyanmar ? "ကျော်လွန်" : "Overdue", color: "bg-red-500/15 text-red-400 border-red-500/30" };
    return { text: isMyanmar ? "စောင့်ဆိုင်း" : "Pending", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
  };


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
            onClick={() => setDeleteTargetId(null)}
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
      {deleteTargetId && <DeleteModal />}
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{t("myTasks")}</h1>
            <p className="text-xs text-[var(--nx-text-muted-updated)]">
              {new Date().toLocaleDateString(isMyanmar ? "my-MM" : "en-US", { weekday: "short", month: "short", day: "numeric" })}
              {" • "}
              {notes.filter((n) => !n.isCompleted).length} {isMyanmar ? "လုပ်ငန်းများ" : "active"}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg text-white">
              <Search size={18} />
            </button>
            <button className="p-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg text-white">
              <Bell size={18} />
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
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {[
            { id: "all", label: t("all") },
            { id: "today", label: t("today") },
            { id: "upcoming", label: t("upcoming") },
            { id: "overdue", label: t("overdue") },
            { id: "completed", label: t("completed") },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as Filter)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition ${
                filter === f.id
                  ? "bg-[var(--nx-cyan)] text-black"
                  : "bg-[var(--nx-bg-card)] text-[var(--nx-text-muted-updated)] border border-[var(--nx-border-updated)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nx-text-muted-updated)]" size={16} />
          <input
            type="text"
            placeholder={t("searchTasks")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded-lg py-2.5 pl-9 pr-3 text-sm focus:border-[var(--nx-cyan)] outline-none"
          />
        </div>

        {/* Task List */}
        {loading ? (
          <p className="text-center text-[var(--nx-text-muted-updated)] py-10">Loading...</p>
        ) : filteredNotes.length === 0 ? (
          <div className="p-10 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl">
            <CheckCircle size={40} className="mx-auto text-[var(--nx-text-muted-updated)] opacity-30 mb-3" />
            <p className="text-sm text-[var(--nx-text-muted-updated)]">{t("noTasks")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredNotes.map((note) => {
              const status = getStatusBadge(note);
              return (
                <div
                  key={note.id}
                  className="p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-cyan)] transition"
                >
                  <div className="flex items-start gap-3">
                    {/* Done Checkbox */}
                    <button
                      onClick={() => !note.isCompleted && handleDone(note.id)}
                      disabled={note.isCompleted}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        note.isCompleted
                          ? "bg-green-500 border-green-500"
                          : "border-[var(--nx-text-muted-updated)] hover:border-[var(--nx-cyan)]"
                      }`}
                    >
                      {note.isCompleted && <CheckCircle size={14} className="text-white" />}
                    </button>

                    {/* Content */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => router.push(`/notes/${note.id}`)}
                    >
                      <p className={`font-semibold text-sm mb-1 ${note.isCompleted ? "line-through text-[var(--nx-text-muted-updated)]" : "text-white"}`}>
                        {note.title}
                      </p>
                      {note.body && (
                        <p className="text-xs text-[var(--nx-text-muted-updated)] line-clamp-1 mb-2">{note.body}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className={`px-2 py-0.5 rounded border font-bold ${status.color}`}>
                          {status.text}
                        </span>
                        <span className={`px-2 py-0.5 rounded border font-bold ${getPriorityColor(note.priority)}`}>
                          {t(note.priority as any)}
                        </span>
                        {note.reminderAt && (
                          <span className="text-[var(--nx-text-muted-updated)] flex items-center gap-1">
                            <Clock size={10} /> {new Date(note.reminderAt).toLocaleTimeString(isMyanmar ? "my-MM" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                        {note.recurrence && note.recurrence !== "none" && (
                          <span className="text-[var(--nx-text-muted-updated)]">
                            🔁 {t(note.recurrence as any)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 text-[var(--nx-error)] hover:bg-[var(--nx-error)]/10 rounded flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Add Button */}
        <button
          onClick={() => router.push("/notes/add")}
          className="fixed bottom-20 right-4 z-40 px-5 py-3 bg-[var(--nx-cyan)] text-black font-bold rounded-full shadow-2xl hover:opacity-90 transition flex items-center gap-1.5"
        >
          <Plus size={18} /> {isMyanmar ? "အသစ်" : "New"}
        </button>
      </main>
      <BottomNav />
    </div>
  );
}
