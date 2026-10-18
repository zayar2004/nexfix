"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

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
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({
    title: "", body: "", reminderAt: "", recurrence: "none" as "none" | "daily" | "weekly" | "monthly" | "yearly"
  });

  const fetchNotes = useCallback(() => {
    if (!session?.user) return;
    fetch("/api/notes").then(res => res.json()).then(data => {
      if (data.ok) setNotes(data.data);
      setLoading(false);
    });
  }, [session]);

  useEffect(() => { if (session?.user) fetchNotes(); }, [session, fetchNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          body: form.body || undefined,
          reminderAt: form.reminderAt ? new Date(form.reminderAt).toISOString() : null,
          recurrence: form.recurrence,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setForm({ title: "", body: "", reminderAt: "", recurrence: "none" });
      setShowForm(false);
      fetchNotes();
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : "Unknown"));
    }
  };

  const handleToggleDone = async (id: string, current: boolean) => {
    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isCompleted: !current }),
    });
    fetchNotes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    fetchNotes();
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex flex-col items-center justify-center p-4">
        <p className="text-white mb-4">Please sign in to view your notes.</p>
        <button onClick={() => router.push("/login")} className="px-4 py-2 bg-[var(--nx-accent)] text-black rounded-lg font-bold">Sign In</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">My Notes</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[var(--nx-accent)] text-black font-semibold rounded-lg"
          >
            {showForm ? "Cancel" : "+ New Note"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6 flex flex-col gap-3">
            <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
            <textarea placeholder="Body (Optional)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={3} />
            <input type="datetime-local" value={form.reminderAt} onChange={(e) => setForm({ ...form, reminderAt: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />
            <select value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value as "none" | "daily" | "weekly" | "monthly" | "yearly" })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3">
              <option value="none">No Repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button type="submit" className="py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg">Create Note</button>
          </form>
        )}

        {loading ? (
          <p className="text-white">Loading...</p>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">
            No notes yet. Click &quot;+ New Note&quot; to add one.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map(n => (
              <div key={n.id} className={`p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl ${n.isCompleted ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={n.isCompleted}
                    onChange={() => handleToggleDone(n.id, n.isCompleted)}
                    className="mt-1 w-5 h-5 accent-[var(--nx-accent)]"
                  />
                  <div className="flex-1">
                    <h3 className={`font-semibold ${n.isCompleted ? "line-through text-[var(--nx-text-muted-updated)]" : "text-white"}`}>{n.title}</h3>
                    {n.body && <p className="text-sm text-[var(--nx-text-secondary-updated)] mt-1">{n.body}</p>}
                    {n.reminderAt && <p className="text-xs text-[var(--nx-warning)] mt-2">⏰ {new Date(n.reminderAt).toLocaleString()} {n.recurrence !== "none" && `(${n.recurrence})`}</p>}
                  </div>
                  <button onClick={() => handleDelete(n.id)} className="text-[var(--nx-error)] text-sm hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
