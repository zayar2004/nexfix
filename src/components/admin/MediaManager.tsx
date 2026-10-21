"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Upload, Image as ImageIcon } from "lucide-react";

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

  const loadImages = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/media?ownerType=${ownerType}&ownerId=${ownerId}`);
      const data = await res.json();
      if (data.ok) {
        const filtered = data.data.filter((m: any) => m.ownerType === ownerType && m.ownerId === ownerId);
        const withUrls = filtered.map((m: any) => ({
          ...m,
          url: m.url || `${process.env.NEXT_PUBLIC_S3_URL}/${m.storageKey}`
        }));
        setImages(withUrls);
      }
    } catch (err) {
      console.error(err);
    }
  }, [ownerType, ownerId]);

  useEffect(() => {
    if (ownerId) loadImages();
  }, [ownerId, loadImages]);

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
      await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
      loadImages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload Button */}
      <label className={`w-full py-3 bg-[var(--nx-bg-base-deep)] border-2 border-dashed border-[var(--nx-border-updated)] text-[var(--nx-text-muted-updated)] text-sm font-medium rounded-xl hover:border-[var(--nx-cyan)] hover:text-[var(--nx-cyan)] transition flex flex-col items-center justify-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        <Upload size={20} />
        {uploading ? "Uploading..." : "Click to Upload Image"}
        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </label>
      {error && <p className="text-xs text-red-400 text-center bg-red-500/10 p-2 rounded-lg">{error}</p>}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--nx-border-updated)] bg-[var(--nx-bg-base-deep)]">
              <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
              
              {/* Delete Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-white text-xs font-bold">Delete?</span>
              </div>
              
              {/* Delete Button (Always visible for mobile) */}
              <button 
                type="button"
                onClick={() => handleDelete(img.id)} 
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                title="Delete Image"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="text-center py-6 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] rounded-xl">
          <ImageIcon size={32} className="mx-auto text-[var(--nx-text-muted-updated)] opacity-30 mb-2" />
          <p className="text-xs text-[var(--nx-text-muted-updated)]">No images uploaded yet.</p>
        </div>
      )}
    </div>
  );
}
