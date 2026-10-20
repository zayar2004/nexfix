"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, ArrowUp, ArrowDown, Plus } from "lucide-react";

type Props = {
  value: string[];                    // Array of URLs
  onChange: (urls: string[]) => void;
  ownerType?: string;
  ownerId?: string;
  label?: string;
  maxSizeMB?: number;
};

type ExistingMedia = {
  id: string;
  url: string;
  storageKey: string;
};

export function GalleryUploadField({
  value,
  onChange,
  ownerType = "admin",
  ownerId,
  label = "Gallery Images",
  maxSizeMB = 5,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showExisting, setShowExisting] = useState(false);
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadExistingMedia = async () => {
    setShowExisting(true);
    setLoadingExisting(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.ok) {
        setExistingMedia(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError(`Skipped non-image file: ${file.name}`);
          continue;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`Skipped ${file.name}: exceeds ${maxSizeMB}MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("ownerType", ownerType);
        if (ownerId) formData.append("ownerId", ownerId);

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Upload failed");

        const media = data.data || {};
        const url =
          media.url ||
          (media.storageKey
            ? `${process.env.NEXT_PUBLIC_S3_URL}/${media.storageKey}`
            : "") ||
          "";
        if (url) uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addFromExisting = (url: string) => {
    if (value.includes(url)) return;
    onChange([...value, url]);
  };

  const removeAt = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...value];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx: number) => {
    if (idx === value.length - 1) return;
    const next = [...value];
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    onChange(next);
  };

  const addManualUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (value.includes(url)) {
      setError("Image already added.");
      return;
    }
    onChange([...value, url]);
    setUrlInput("");
    setError("");
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-[var(--nx-text-muted-updated)] uppercase tracking-wide">
        {label} ({value.length} {value.length === 1 ? "image" : "images"})
      </label>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-[var(--nx-accent)] text-black text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? "Uploading..." : "Upload Images (Multiple)"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={loadExistingMedia}
          disabled={uploading}
          className="px-4 py-2 bg-[var(--nx-bg-base-deep)] text-[var(--nx-text-primary)] border border-[var(--nx-border-updated)] text-sm font-bold rounded-lg hover:border-[var(--nx-accent)] disabled:opacity-50 flex items-center gap-2"
        >
          <ImageIcon size={16} />
          Choose Existing
        </button>
      </div>

      {/* Manual URL */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or add URL manually: https://..."
          className="flex-1 bg-[var(--nx-bg-base-deep)] text-[var(--nx-text-primary)] border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm focus:border-[var(--nx-accent)] outline-none"
        />
        <button
          type="button"
          onClick={addManualUrl}
          className="px-3 py-2 bg-[var(--nx-bg-base-deep)] text-[var(--nx-text-primary)] border border-[var(--nx-border-updated)] rounded-lg hover:border-[var(--nx-accent)]"
        >
          <Plus size={16} />
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Preview Grid */}
      {value.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--nx-border-updated)] rounded-lg p-8 text-center text-[var(--nx-text-muted-updated)]">
          <ImageIcon size={32} className="mx-auto mb-2" />
          <p className="text-xs">No gallery images yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {value.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative bg-[var(--nx-bg-base-deep)] rounded-lg overflow-hidden border border-[var(--nx-border-updated)] group"
            >
              <div className="aspect-video">
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0.3";
                  }}
                />
              </div>
              <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {idx + 1}
              </div>
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="bg-black/70 text-white rounded w-6 h-6 flex items-center justify-center disabled:opacity-30"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === value.length - 1}
                  className="bg-black/70 text-white rounded w-6 h-6 flex items-center justify-center disabled:opacity-30"
                >
                  <ArrowDown size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="bg-red-600 text-white rounded w-6 h-6 flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing Media Modal */}
      {showExisting && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--nx-border-updated)]">
              <h3 className="text-lg font-bold text-[var(--nx-text-primary)]">
                Add from Media Library
              </h3>
              <button
                type="button"
                onClick={() => setShowExisting(false)}
                className="text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-text-primary)]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingExisting ? (
                <p className="text-center text-[var(--nx-text-muted-updated)]">Loading...</p>
              ) : existingMedia.length === 0 ? (
                <p className="text-center text-[var(--nx-text-muted-updated)]">
                  No images in Media Library yet.
                </p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {existingMedia.map((m) => {
                    const selected = value.includes(m.url);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => addFromExisting(m.url)}
                        disabled={selected}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                          selected
                            ? "border-green-500 opacity-60"
                            : "border-[var(--nx-border-updated)] hover:border-[var(--nx-accent)]"
                        }`}
                      >
                        <img
                          src={m.url}
                          alt={m.storageKey}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
