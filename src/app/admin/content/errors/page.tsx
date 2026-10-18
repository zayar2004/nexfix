"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Machine = { id: string; name: string };
type ErrorCode = { id: string; code: string; title: string; machineId: string };

export default function AdminErrorsPage() {
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [errors, setErrors] = useState<ErrorCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  const [form, setForm] = useState({
    machineId: "", code: "", title: "", videoUrl: "",
    cause: "", troubleshooting: "", solution: "", safety: ""
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/admin/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage("✅ Error code added!");
      setForm({ machineId: "", code: "", title: "", videoUrl: "", cause: "", troubleshooting: "", solution: "", safety: "" });
      fetchData();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Manage Error Codes</h1>
          <button onClick={() => router.push("/admin")} className="text-sm text-[var(--nx-accent)]">← Back</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6 flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">Add New Error Code</h2>
          
          <select value={form.machineId} onChange={(e) => setForm({ ...form, machineId: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required>
            <option value="">Select Machine...</option>
            {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          
          <input type="text" placeholder="Error Code (e.g., E-001)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          <input type="text" placeholder="Error Title (e.g., Monitor Display Error)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          <input type="url" placeholder="YouTube Video Link (Optional)" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />
          
          <textarea placeholder="Cause (Optional)" value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />
          <textarea placeholder="Troubleshooting (Optional)" value={form.troubleshooting} onChange={(e) => setForm({ ...form, troubleshooting: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />
          <textarea placeholder="Solution (Optional)" value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />
          <textarea placeholder="Safety Warning (Optional)" value={form.safety} onChange={(e) => setForm({ ...form, safety: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />
          
          <button type="submit" className="py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg">Add Error Code</button>
          {message && <p className="text-center text-sm">{message}</p>}
        </form>

        <h2 className="text-lg font-semibold text-white mb-3">Existing Error Codes</h2>
        {loading ? <p className="text-white">Loading...</p> : (
          <div className="flex flex-col gap-2">
            {errors.map(e => (
              <div key={e.id} className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <p className="font-semibold text-white">{e.code} - {e.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
