"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { VideoManager } from "@/components/admin/VideoManager";
import { MediaManager } from "@/components/admin/MediaManager";

type Machine = { id: string; name: string };
type ErrorCode = {
  id: string;
  code: string;
  title: string;
  machineId: string;
  machineName?: string;
  videoUrl?: string | null;
  cause?: string;
  troubleshooting?: string;
  solution?: string;
  safety?: string;
  notes?: string;
};

export default function AdminErrorsPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [errors, setErrors] = useState<ErrorCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    machineId: "", code: "", title: "", videoUrl: "",
    cause: "", troubleshooting: "", solution: "", safety: "", notes: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const [mRes, eRes] = await Promise.all([
      fetch("/api/admin/machines").then(r => r.json()),
      fetch("/api/admin/errors").then(r => r.json())
    ]);
    if (mRes.ok) setMachines(mRes.data);
    if (eRes.ok) setErrors(eRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ machineId: "", code: "", title: "", videoUrl: "", cause: "", troubleshooting: "", solution: "", safety: "", notes: "" });
    setIsEditing(false);
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const method = isEditing ? "PATCH" : "POST";
    const body = isEditing ? { id: editId, ...form } : form;

    try {
      const res = await fetch("/api/admin/errors", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      setMessage(isEditing ? "✅ Error updated!" : "✅ Error added!");
      resetForm();
      fetchData();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const handleEdit = (err: ErrorCode) => {
    setIsEditing(true);
    setEditId(err.id);
    setForm({
      machineId: err.machineId,
      code: err.code,
      title: err.title,
      videoUrl: err.videoUrl || "",
      cause: err.cause || "",
      troubleshooting: err.troubleshooting || "",
      solution: err.solution || "",
      safety: err.safety || "",
      notes: err.notes || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this error?")) return;
    try {
      const res = await fetch(`/api/admin/errors?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage("✅ Error deleted!");
      fetchData();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  return (
    <AdminLayout title="Error Code Management">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6 flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">{isEditing ? "Edit Error Code" : "Add New Error Code"}</h2>

          <select value={form.machineId} onChange={(e) => setForm({ ...form, machineId: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required>
            <option value="">Select Machine...</option>
            {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Error Code (e.g., E-001)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
            <input type="text" placeholder="Error Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          </div>

          <textarea placeholder="Cause (Optional)" value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />
          <textarea placeholder="Troubleshooting (Optional)" value={form.troubleshooting} onChange={(e) => setForm({ ...form, troubleshooting: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />
          <textarea placeholder="Solution (Optional)" value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />
          <textarea placeholder="Safety Warning (Optional)" value={form.safety} onChange={(e) => setForm({ ...form, safety: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />
          <textarea placeholder="Technician Notes (Optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />

          {isEditing && editId && (
            <>
              <div className="border-t border-[var(--nx-border-updated)] pt-3">
                <p className="text-sm text-[var(--nx-text-muted)] mb-2">Photos</p>
                <MediaManager ownerType="error" ownerId={editId} />
              </div>
              <div className="border-t border-[var(--nx-border-updated)] pt-3">
                <p className="text-sm text-[var(--nx-text-muted)] mb-2">Videos</p>
                <VideoManager ownerType="error" ownerId={editId} />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg">{isEditing ? "Update Error" : "Add Error Code"}</button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="px-4 py-3 bg-[var(--nx-bg-surface-deep)] text-white rounded-lg">Cancel</button>
            )}
          </div>
          {message && <p className="text-center text-sm">{message}</p>}
        </form>

        <h2 className="text-lg font-semibold text-white mb-3">Existing Error Codes ({errors.length})</h2>
        {loading ? <p className="text-white">Loading...</p> : (
          <div className="flex flex-col gap-2">
            {errors.map(e => (
              <div key={e.id} className="flex items-center justify-between p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <div>
                  <p className="font-semibold text-white">{e.code} - {e.title}</p>
                  <p className="text-xs text-[var(--nx-text-muted)]">{e.machineName}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(e)} className="px-3 py-1.5 text-xs font-medium bg-[var(--nx-bg-surface-deep)] text-white rounded-lg hover:bg-[var(--nx-bg-elevated-deep)]">Edit</button>
                  <button onClick={() => handleDelete(e.id)} className="px-3 py-1.5 text-xs font-medium bg-[var(--nx-error)]/10 text-[var(--nx-error)] border border-[var(--nx-error)]/30 rounded-lg hover:bg-[var(--nx-error)]/20">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
