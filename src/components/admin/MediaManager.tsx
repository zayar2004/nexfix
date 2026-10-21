"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Upload } from "lucide-react";

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
      // Input ကို ရှင်းမယ် (တူညီတဲ့ ပုံကို ထပ်တင်လို့ရအောင်)
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
    <div className="flex flex-col gap-3">
      <label className={`w-full py-2 bg-[var(--nx-bg-base-deep)] border border-dashed border-[var(--nx-border-updated)] text-[var(--nx-text-muted-updated)] text-sm rounded-lg hover:border-[var(--nx-cyan)] transition flex items-center justify-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        <Upload size={16} /> {uploading ? "Uploading..." : "+ Upload Image"}
        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {images.map((img) => (
            <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-[var(--nx-border-updated)]">
              <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
              
              {/* ဖုန်းပေါ်မှာလည်း အမြဲမြင်ရအောင် opacity-100 ထားမယ် */}
              <button 
                type="button"
                onClick={() => handleDelete(img.id)} 
                className="absolute top-1 right-1 p-1.5 bg-black/70 text-red-400 rounded-md hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
