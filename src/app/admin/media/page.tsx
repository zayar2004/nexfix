"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminLang } from "@/lib/admin-lang-context";


type MediaItem = {
  id: string;
  url: string;
  mime: string;
  size: string;
  createdAt: string;
};

export default function MediaLibraryPage() {
  const { t } = useAdminLang();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
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
      fetchMedia();
    } catch (err) {
      alert("Upload failed: " + (err instanceof Error ? err.message : "Unknown"));
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
      fetchMedia();
    } catch (err) {
      alert("Delete failed: " + (err instanceof Error ? err.message : "Unknown"));
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL Copied!");
  };

  return (
    <AdminLayout title={t("mediaLibrary")}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <label className="cursor-pointer px-4 py-2.5 bg-[var(--nx-accent)] text-black font-bold rounded-lg hover:opacity-90">
            {uploading ? t("uploading") : "+ " + t("uploadMedia")}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" ref={fileRef} />
          </label>
        </div>

        {loading ? (
          <p className="text-white">{t("saving")}</p>
        ) : media.length === 0 ? (
          <p className="text-[var(--nx-text-muted-updated)]">{t("noArticles")}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {media.map(m => (
              <div key={m.id} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl overflow-hidden">
                <img src={m.url} alt="Media" className="w-full h-32 object-cover" />
                <div className="p-2 flex justify-between gap-1">
                  <button onClick={() => copyUrl(m.url)} className="text-xs bg-[var(--nx-bg-surface-deep)] px-2 py-1 rounded text-white flex-1 hover:bg-[var(--nx-border-updated)]">{t("copyUrl")}</button>
                  <button onClick={() => handleDelete(m.id)} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30">{t("deleteMedia")}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
