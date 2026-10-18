"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Machine = { id: string; name: string; code: string; description: string | null };

export default function AdminMachinesPage() {
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const [message, setMessage] = useState("");

  const fetchMachines = () => {
    fetch("/api/admin/machines").then(res => res.json()).then(data => {
      if (data.ok) setMachines(data.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchMachines(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/admin/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage("✅ Machine added!");
      setForm({ name: "", code: "", description: "" });
      fetchMachines();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Manage Machines</h1>
          <button onClick={() => router.push("/admin")} className="text-sm text-[var(--nx-accent)]">← Back</button>
        </div>

        {/* Add Form */}
        <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6 flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">Add New Machine</h2>
          <input type="text" placeholder="Machine Name (e.g., Tekken 7)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          <input type="text" placeholder="Machine Code (e.g., TK7-001)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          <input type="text" placeholder="Description (Optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />
          <button type="submit" className="py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg">Add Machine</button>
          {message && <p className="text-center text-sm">{message}</p>}
        </form>

        {/* List */}
        <h2 className="text-lg font-semibold text-white mb-3">Existing Machines</h2>
        {loading ? <p className="text-white">Loading...</p> : (
          <div className="flex flex-col gap-2">
            {machines.map(m => (
              <div key={m.id} className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <p className="font-semibold text-white">{m.name}</p>
                <p className="text-sm text-[var(--nx-text-muted-updated)]">{m.code}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
