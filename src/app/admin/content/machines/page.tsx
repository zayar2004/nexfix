"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";

import { AdminLayout } from "@/components/admin/AdminLayout";

type Machine = { id: string; name: string; code: string; description: string | null };

export default function AdminMachinesPage() {
  
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

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
    
    const method = isEditing ? "PATCH" : "POST";
    const body = isEditing ? { id: editId, ...form } : form;

    try {
      const res = await fetch("/api/admin/machines", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      
      setMessage(isEditing ? "✅ Machine updated!" : "✅ Machine added!");
      setForm({ name: "", code: "", description: "" });
      setIsEditing(false);
      setEditId(null);
      fetchMachines();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const handleEdit = (m: Machine) => {
    setIsEditing(true);
    setEditId(m.id);
    setForm({ name: m.name, code: m.code, description: m.description || "" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this machine?")) return;
    try {
      const res = await fetch(`/api/admin/machines?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage("✅ Machine deleted!");
      fetchMachines();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  return (
    <AdminLayout title="Machine Management">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6 flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">{isEditing ? "Edit Machine" : "Add New Machine"}</h2>
          <input type="text" placeholder="Machine Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          <input type="text" placeholder="Machine Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          <input type="text" placeholder="Description (Optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />
          
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg">{isEditing ? "Update Machine" : "Add Machine"}</button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setEditId(null); setForm({ name: "", code: "", description: "" }); }} className="px-4 py-3 bg-[var(--nx-bg-surface-deep)] text-white rounded-lg">Cancel</button>
            )}
          </div>
          {message && <p className="text-center text-sm">{message}</p>}
        </form>

        <h2 className="text-lg font-semibold text-white mb-3">Existing Machines ({machines.length})</h2>
        {loading ? <p className="text-white">Loading...</p> : (
          <div className="flex flex-col gap-2">
            {machines.map(m => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <div>
                  <p className="font-semibold text-white">{m.name}</p>
                  <p className="text-sm text-[var(--nx-text-muted-updated)]">{m.code}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(m)} className="px-3 py-1.5 text-xs font-medium bg-[var(--nx-bg-surface-deep)] text-white rounded-lg hover:bg-[var(--nx-bg-elevated-deep)]">Edit</button>
                  <button onClick={() => handleDelete(m.id)} className="px-3 py-1.5 text-xs font-medium bg-[var(--nx-error)]/10 text-[var(--nx-error)] border border-[var(--nx-error)]/30 rounded-lg hover:bg-[var(--nx-error)]/20">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
