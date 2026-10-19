"use client";

import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Toast, ToastType } from "@/components/ui/Toast";
import { Copy, Trash2, Upload } from "lucide-react";

type MediaItem = {
  id: string;
  url: string;
  mime: string;
  size: string;
  createdAt: string;
};

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.ok) setMedia(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("ownerType", "asset");
    formData.append("ownerId", "admin");

    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setToast({ message: "Image uploaded successfully", type: "success" });
      fetchMedia();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Upload failed", type: "error" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media?")) return;
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setToast({ message: "Image deleted", type: "success" });
      fetchMedia();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Delete failed", type: "error" });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setToast({ message: "URL copied to clipboard", type: "success" });
  };

  return (
    <AdminLayout title="Media Library">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <label className="cursor-pointer px-4 py-2.5 bg-[var(--nx-accent)] text-black font-bold rounded-lg hover:opacity-90 flex items-center gap-2">
            <Upload size={18} />
            {uploading ? "Uploading..." : "Upload Media"}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" ref={fileRef} />
          </label>
        </div>

        {loading ? (
          <p className="text-white">Loading...</p>
        ) : media.length === 0 ? (
          <p className="text-[var(--nx-text-muted-updated)]">No media found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {media.map(m => (
              <div key={m.id} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl overflow-hidden group">
                <div className="aspect-square bg-[var(--nx-bg-base-deep)]">
                  <img src={m.url} alt="Media" className="w-full h-full object-cover" />
                </div>
                <div className="p-2 flex gap-1">
                  <button 
                    onClick={() => copyUrl(m.url)} 
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-[var(--nx-bg-surface-deep)] hover:bg-[var(--nx-border-updated)] text-white py-2 rounded-lg transition"
                  >
                    <Copy size={12} /> Copy
                  </button>
                  <button 
                    onClick={() => handleDelete(m.id)} 
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 py-2 rounded-lg transition"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </AdminLayout>
  );
}
