"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import { List, Upload, Image as ImageIcon, Video, Plus, X, Save, CheckCircle, AlertCircle, Edit } from "lucide-react";

export const dynamic = "force-dynamic";

type Machine = { id: string; name: string };

function ErrorFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");

  const [machines, setMachines] = useState<Machine[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [form, setForm] = useState({
    machineName: "", code: "", title: "", 
    solution: "", cause: "", troubleshooting: "", safety: "", notes: ""
  });
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([""]);

  useEffect(() => {
    fetch("/api/admin/machines").then(r => r.json()).then(data => {
      if (data.ok) setMachines(data.data);
    }).catch(console.error);

    if (editId) {
      setFetching(true);
      fetch("/api/admin/errors").then(r => r.json()).then(data => {
        if (data.ok) {
          const target = data.data.find((e: any) => e.id === editId);
          if (target) {
            setForm({
              machineName: target.machineName,
              code: target.code,
              title: target.title,
              solution: target.solution || "",
              cause: target.cause || "",
              troubleshooting: target.troubleshooting || "",
              safety: target.safety || "",
              notes: target.notes || "",
            });
            setImageUrls(target.images && target.images.length > 0 ? target.images : [""]);
            setYoutubeUrls(target.videos && target.videos.length > 0 ? target.videos : [""]);
          }
        }
      }).finally(() => setFetching(false));
    }
  }, [editId]);

  const resetForm = () => {
    setForm({ machineName: "", code: "", title: "", solution: "", cause: "", troubleshooting: "", safety: "", notes: "" });
    setImageUrls([""]);
    setYoutubeUrls([""]);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const body = {
        id: editId || undefined,
        ...form,
        imageUrls: imageUrls.filter(url => url.trim() !== ""),
        youtubeUrls: youtubeUrls.filter(url => url.trim() !== ""),
      };

      const method = editId ? "PATCH" : "POST";

      const res = await fetch("/api/admin/errors", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      setMessage({ text: editId ? "Error updated successfully!" : "Error added successfully!", type: "success" });
      if (editId) { router.push("/admin/content/errors/list"); }
      if (!editId) resetForm();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64 text-white">Loading data...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <button onClick={() => router.back()} className="px-4 py-2.5 bg-transparent text-white hover:text-[var(--nx-accent)] transition flex items-center gap-1 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <Link href="/admin/content/errors/list" className="px-5 py-2.5 bg-[var(--nx-bg-surface-deep)] border border-[var(--nx-border-updated)] text-white font-medium rounded-lg hover:bg-[var(--nx-border-updated)] transition flex items-center gap-2 text-sm">
          <List size={18} /> View All Errors
        </Link>
        <Link href="/admin/content/import" className="px-5 py-2.5 bg-[var(--nx-bg-surface-deep)] border border-[var(--nx-border-updated)] text-white font-medium rounded-lg hover:bg-[var(--nx-border-updated)] transition flex items-center gap-2 text-sm">
          <Upload size={18} /> Excel Bulk Import
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          {editId ? <><Edit size={24} className="text-[var(--nx-accent)]" /> Edit Error Code</> : <><Plus size={24} className="text-[var(--nx-accent)]" /> Add New Error Code</>}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase tracking-wide">Machine Name <span className="text-red-400">*</span></label>
            <input type="text" list="machine-suggestions" placeholder="Type or select machine..." value={form.machineName} onChange={(e) => setForm({ ...form, machineName: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none transition" required />
            <datalist id="machine-suggestions">
              {machines.map(m => <option key={m.id} value={m.name} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase tracking-wide">Error Code <span className="text-red-400">*</span></label>
            <input type="text" placeholder="e.g., E-001" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none transition" required />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase tracking-wide">Error Name <span className="text-red-400">*</span></label>
          <input type="text" placeholder="e.g., Motor Overheat" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none transition" required />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase tracking-wide">Error Fix (Solution) <span className="text-red-400">*</span></label>
          <textarea placeholder="How to fix this error..." value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none transition" rows={3} required />
        </div>

        <div className="border-t border-[var(--nx-border-updated)] pt-4 mt-6 mb-4">
          <h3 className="text-sm font-bold text-white mb-3">Additional Details (Optional)</h3>
          <div className="grid grid-cols-1 gap-3">
            <textarea placeholder="Cause (What causes this error?)" value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none transition" rows={2} />
            <textarea placeholder="Troubleshooting (How to check)" value={form.troubleshooting} onChange={(e) => setForm({ ...form, troubleshooting: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none transition" rows={2} />
            <textarea placeholder="Safety Warning" value={form.safety} onChange={(e) => setForm({ ...form, safety: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none transition" rows={2} />
            <textarea placeholder="Technician Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none transition" rows={2} />
          </div>
        </div>

        <div className="border-t border-[var(--nx-border-updated)] pt-4 mb-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><ImageIcon size={16} /> Images (URLs)</h3>
          <div className="flex flex-col gap-2">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="url" placeholder="https://example.com/image.jpg" value={url} onChange={(e) => {
                  const newUrls = [...imageUrls];
                  newUrls[idx] = e.target.value;
                  setImageUrls(newUrls);
                }} className="flex-1 bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm focus:border-[var(--nx-accent)] outline-none" />
                {imageUrls.length > 1 && (
                  <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== idx))} className="px-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><X size={16}/></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setImageUrls([...imageUrls, ""])} className="text-sm text-[var(--nx-accent)] text-left hover:underline mt-1 font-medium">+ Add another image</button>
          </div>
        </div>

        <div className="border-t border-[var(--nx-border-updated)] pt-4 mb-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Video size={16} /> YouTube Videos (URLs)</h3>
          <div className="flex flex-col gap-2">
            {youtubeUrls.map((url, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="url" placeholder="https://youtube.com/watch?v=..." value={url} onChange={(e) => {
                  const newUrls = [...youtubeUrls];
                  newUrls[idx] = e.target.value;
                  setYoutubeUrls(newUrls);
                }} className="flex-1 bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm focus:border-[var(--nx-accent)] outline-none" />
                {youtubeUrls.length > 1 && (
                  <button type="button" onClick={() => setYoutubeUrls(youtubeUrls.filter((_, i) => i !== idx))} className="px-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><X size={16}/></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setYoutubeUrls([...youtubeUrls, ""])} className="text-sm text-[var(--nx-accent)] text-left hover:underline mt-1 font-medium">+ Add another video</button>
          </div>
        </div>

        <div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg hover:opacity-90 transition text-lg disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={20} /> {loading ? "Saving..." : (editId ? "Update Error Code" : "Save New Error Code")}
          </button>
        </div>
        {message && (
          <p className={`mt-3 text-center text-sm font-semibold p-2 rounded flex items-center justify-center gap-2 ${message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {message.type === "success" ? <CheckCircle size={16}/> : <AlertCircle size={16}/>} {message.text}
          </p>
        )}
      </form>
    </div>
  );
}

export default function AdminErrorsPage() {
  return (
    <AdminLayout title="Error Management">
      <Suspense fallback={<div className="flex justify-center items-center h-64 text-white">Loading...</div>}>
        <ErrorFormContent />
      </Suspense>
    </AdminLayout>
  );
}
