"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { FileText, Upload, Trash2 } from "lucide-react";

type Pdf = {
  id: string;
  title: string;
  description: string | null;
  storageKey: string;
  size: string | null;
};

export default function AdminPdfsPage() {
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  const fetchPdfs = () => {
    setLoading(true);
    fetch("/api/admin/pdfs")
      .then((res) => res.json())
      .then((data) => { if (data.ok) setPdfs(data.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPdfs(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form.title) return alert("Please provide a title and file.");
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", form.title);
    formData.append("description", form.description);

    try {
      const res = await fetch("/api/admin/pdfs", { method: "POST", body: formData });
      const data = await res.json();
      if (data.ok) {
        setForm({ title: "", description: "" });
        fetchPdfs();
      } else {
        alert(data.error);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this PDF?")) return;
    await fetch(`/api/admin/pdfs?id=${id}`, { method: "DELETE" });
    fetchPdfs();
  };

  return (
    <AdminLayout title="PDF Manuals">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FileText className="text-[var(--nx-cyan)]" size={28} /> PDF Manuals
        </h1>

        {/* Upload Form */}
        <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-5 mb-6 flex flex-col gap-3">
          <input 
            type="text" 
            placeholder="Document Title" 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3"
          />
          <input 
            type="text" 
            placeholder="Description (Optional)" 
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3"
          />
          <label className={`py-3 bg-[var(--nx-cyan)] text-black font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
            <Upload size={18} /> {uploading ? "Uploading..." : "Select PDF and Upload"}
            <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {/* List */}
        {loading ? <p className="text-center text-white">Loading...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pdfs.map((pdf) => (
              <div key={pdf.id} className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl flex items-start gap-3">
                <FileText size={24} className="text-[var(--nx-cyan)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{pdf.title}</p>
                  <p className="text-xs text-[var(--nx-text-muted-updated)] truncate">{pdf.description}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{pdf.size}</p>
                </div>
                <button onClick={() => handleDelete(pdf.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
