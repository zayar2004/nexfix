"use client";

import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";

type MediaItem = {
  id: string;
  mime: string;
  size: string;
  storageKey: string;
  status: string;
  url?: string;
};

export default function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = () => {
    fetch("/api/admin/media")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setMediaItems(
            data.data.map((m: MediaItem) => ({
              ...m,
              url: `/uploads/${m.storageKey}`,
            }))
          );
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage("✅ Image uploaded!");
      fetchMedia();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Upload failed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage("✅ Image deleted!");
      fetchMedia();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Delete failed"));
    }
  };

  // Copy URL function အသစ်
  const handleCopy = (url: string) => {
    // localhost ကို အစားထိုးပြီး လက်ရှိ domain ကို ယူမယ် (အွန်လိုင်းတင်ရင် အလုပ်ဖြစ်အောင်)
    const fullUrl = typeof window !== "undefined" ? window.location.origin + url : url;
    navigator.clipboard.writeText(fullUrl);
    setMessage("✅ URL Copied!");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <AdminLayout title="Media Library">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Image Assets</h2>
            <p className="text-sm text-[var(--nx-text-muted-updated)]">JPG, PNG, WebP. Max 5MB each.</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-[var(--nx-accent)] text-black font-semibold rounded-lg hover:brightness-110"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        </div>

        {message && <p className="mb-4 text-sm text-center text-[var(--nx-accent)]">{message}</p>}

        {loading ? (
          <p className="text-white">Loading...</p>
        ) : mediaItems.length === 0 ? (
          <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">
            No images uploaded yet. Click &quot;Upload Image&quot; to start.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map((m) => (
              <div key={m.id} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl overflow-hidden">
                <div
                  className="aspect-video bg-[var(--nx-bg-surface-deep)] bg-cover bg-center"
                  style={{ backgroundImage: `url(${m.url})` }}
                />
                <div className="p-3">
                  <p className="text-xs text-[var(--nx-text-muted-updated)] truncate">{m.storageKey}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[var(--nx-text-muted-updated)]">
                      {(Number(m.size) / 1024).toFixed(1)} KB
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleCopy(m.url!)} className="text-xs text-[var(--nx-accent)] hover:underline">
                        Copy URL
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="text-xs text-[var(--nx-error)] hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
