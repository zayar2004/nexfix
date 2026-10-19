"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";

type Note = {
  id: string;
  title: string;
  body: string | null;
  reminderAt: string | null;
  recurrence: string;
  isCompleted: boolean;
};

export default function NotesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useSettings();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const [form, setForm] = useState({
    title: "", body: "", reminderAt: "", recurrence: "none" as "none" | "daily" | "weekly" | "monthly" | "yearly"
  });

  const fetchNotes = useCallback(() => {
    const localNotes = localStorage.getItem("nexfix_notes");
    if (localNotes) {
      setNotes(JSON.parse(localNotes));
    }
    setLoading(false);

    if (navigator.onLine && session?.user) {
      fetch("/api/notes").then(res => res.json()).then(data => {
        if (data.ok) {
          setNotes(data.data);
          localStorage.setItem("nexfix_notes", JSON.stringify(data.data));
        }
      }).catch(() => console.log("Offline mode"));
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) fetchNotes();
    else setLoading(false);
  }, [session, fetchNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: form.title,
      body: form.body || null,
      reminderAt: form.reminderAt ? new Date(form.reminderAt).toISOString() : null,
      recurrence: form.recurrence,
      isCompleted: false,
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem("nexfix_notes", JSON.stringify(updatedNotes));
    setForm({ title: "", body: "", reminderAt: "", recurrence: "none" });
    setShowForm(false);

    if (navigator.onLine) {
      try {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title, body: form.body || undefined, reminderAt: newNote.reminderAt, recurrence: form.recurrence }),
        });
        fetchNotes();
      } catch {}
    }
  };

  const handleToggleDone = async (id: string, current: boolean) => {
    const updatedNotes = notes.map(n => n.id === id ? { ...n, isCompleted: !current } : n);
    setNotes(updatedNotes);
    localStorage.setItem("nexfix_notes", JSON.stringify(updatedNotes));

    if (navigator.onLine) {
      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isCompleted: !current }),
      }).catch(() => {});
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteNote"))) return;
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem("nexfix_notes", JSON.stringify(updatedNotes));

    if (navigator.onLine) {
      await fetch(`/api/notes?id=${id}`, { method: "DELETE" }).catch(() => {});
    }
  };

  // 🌟 Active နဲ့ Completed ခွဲမယ်
  const { activeNotes, completedNotes } = useMemo(() => {
    return {
      activeNotes: notes.filter(n => !n.isCompleted),
      completedNotes: notes.filter(n => n.isCompleted),
    };
  }, [notes]);

  // 🌟 Reminder အတွက် အချိန်ပြမယ်
  const formatReminder = (dateStr: string, recurrence: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const isPast = diff < 0;
    const isWithin24h = diff > 0 && diff < 24 * 60 * 60 * 1000;
    
    const timeStr = date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    return { timeStr, isPast, isWithin24h };
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex flex-col items-center justify-center p-4">
        <p className="text-[var(--nx-text-primary)] mb-4">{t("signInNotes")}</p>
        <button onClick={() => router.push("/login")} className="px-4 py-2 bg-[var(--nx-accent)] text-black rounded-lg font-bold">{t("login")}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--nx-text-primary)]">{t("myNotes")}</h1>
            <p className="text-xs text-[var(--nx-text-muted-updated)] mt-0.5">
              {activeNotes.length} active · {completedNotes.length} completed
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-[var(--nx-accent)] text-black font-semibold rounded-lg text-sm">
            {showForm ? "Cancel" : t("newNote")}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6 flex flex-col gap-3">
            <input type="text" placeholder={t("noteTitle")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-[var(--nx-text-primary)] border border-[var(--nx-border-updated)] rounded-lg p-3" required />
            <textarea placeholder={t("noteBody")} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-[var(--nx-text-primary)] border border-[var(--nx-border-updated)] rounded-lg p-3" rows={3} />
            <input type="datetime-local" value={form.reminderAt} onChange={(e) => setForm({ ...form, reminderAt: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-[var(--nx-text-primary)] border border-[var(--nx-border-updated)] rounded-lg p-3" />
            <select value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value as any })} className="bg-[var(--nx-bg-base-deep)] text-[var(--nx-text-primary)] border border-[var(--nx-border-updated)] rounded-lg p-3">
              <option value="none">{t("noRepeat")}</option>
              <option value="daily">{t("daily")}</option>
              <option value="weekly">{t("weekly")}</option>
              <option value="monthly">{t("monthly")}</option>
              <option value="yearly">{t("yearly")}</option>
            </select>
            <button type="submit" className="py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg">{t("createNote")}</button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[var(--nx-accent)] border-t-transparent rounded-full animate-spin"></div></div>
        ) : activeNotes.length === 0 && completedNotes.length === 0 ? (
          <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">
            No notes yet. Click "{t("newNote")}" to add one.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* 🌟 Active Notes */}
            {activeNotes.length > 0 && (
              <div className="flex flex-col gap-3">
                {activeNotes.map(n => {
                  const reminder = n.reminderAt ? formatReminder(n.reminderAt, n.recurrence) : null;
                  return (
                    <div key={n.id} className={`p-4 bg-[var(--nx-bg-card)] border rounded-xl ${reminder?.isWithin24h ? 'border-[var(--nx-warning)]/50' : 'border-[var(--nx-border-updated)]'}`}>
                      <div className="flex items-start gap-3">
                        <input type="checkbox" checked={n.isCompleted} onChange={() => handleToggleDone(n.id, n.isCompleted)} className="mt-1 w-5 h-5 accent-[var(--nx-accent)] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[var(--nx-text-primary)]">{n.title}</h3>
                          {n.body && <p className="text-sm text-[var(--nx-text-secondary-updated)] mt-1 line-clamp-3">{n.body}</p>}
                          
                          {reminder && (
                            <div className={`mt-2 flex items-center gap-2 text-xs font-medium ${reminder.isPast ? 'text-[var(--nx-error)]' : reminder.isWithin24h ? 'text-[var(--nx-warning)]' : 'text-[var(--nx-text-muted-updated)]'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {reminder.timeStr}
                              {n.recurrence !== "none" && (
                                <span className="px-2 py-0.5 bg-[var(--nx-accent)]/10 text-[var(--nx-accent)] rounded-full text-[10px] font-bold uppercase">
                                  {n.recurrence}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <button onClick={() => handleDelete(n.id)} className="text-[var(--nx-error)] p-1 hover:bg-[var(--nx-error)]/10 rounded flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 🌟 Completed Notes (Toggle) */}
            {completedNotes.length > 0 && (
              <div>
                <button 
                  onClick={() => setShowCompleted(!showCompleted)} 
                  className="flex items-center gap-2 text-sm font-semibold text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-text-primary)] transition-colors mb-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showCompleted ? 'rotate-90' : ''}`}><polyline points="9 18 15 12 9 6"/></svg>
                  Completed ({completedNotes.length})
                </button>
                {showCompleted && (
                  <div className="flex flex-col gap-2">
                    {completedNotes.map(n => (
                      <div key={n.id} className="p-3 bg-[var(--nx-bg-card)]/50 border border-[var(--nx-border-updated)] rounded-xl opacity-60">
                        <div className="flex items-start gap-3">
                          <input type="checkbox" checked={n.isCompleted} onChange={() => handleToggleDone(n.id, n.isCompleted)} className="mt-1 w-5 h-5 accent-[var(--nx-accent)] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[var(--nx-text-muted-updated)] line-through">{n.title}</h3>
                            {n.body && <p className="text-xs text-[var(--nx-text-muted-updated)] mt-1 line-clamp-2 line-through">{n.body}</p>}
                          </div>
                          <button onClick={() => handleDelete(n.id)} className="text-[var(--nx-error)] p-1 hover:bg-[var(--nx-error)]/10 rounded flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
