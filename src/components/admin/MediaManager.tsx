"use client";

import { useState, useEffect } from "react";

type MediaItem = {
  id: string;
  url: string;
  mime: string;
  storageKey: string;
};

export function MediaManager({ ownerType, ownerId }: { ownerType: string; ownerId: string }) {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadImages = async () => {
    try {
      const res = await fetch(`/api/admin/media?ownerType=${ownerType}&ownerId=${ownerId}`);
      const data = await res.json();
      if (data.ok) {
        // Filter by owner if API returns all
        const filtered = data.data.filter((m: any) => m.ownerType === ownerType && m.ownerId === ownerId);
        // Construct URLs from storageKey (assuming S3 public URL format)
        const withUrls = filtered.map((m: any) => ({
          ...m,
          url: m.url || `${process.env.NEXT_PUBLIC_S3_URL}/${m.storageKey}`
        }));
        setImages(withUrls);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (ownerId) loadImages();
  }, [ownerId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("ownerType", ownerType);
    formData.append("ownerId", ownerId);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label className="cursor-pointer px-4 py-2 bg-[var(--nx-accent)] text-black font-bold rounded-lg text-sm hover:opacity-90">
          {uploading ? "Uploading..." : "+ Upload Image"}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
        {error && <p className="text-sm text-[var(--nx-error)]">{error}</p>}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img src={img.url} alt="Media" className="w-full h-24 object-cover rounded-lg border border-[var(--nx-border-updated)]" />
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
