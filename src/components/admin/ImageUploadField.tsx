"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  ownerType?: string;
  ownerId?: string;
  label?: string;
  aspectRatio?: "video" | "square";
  maxSizeMB?: number;
};

type ExistingMedia = {
  id: string;
  url: string;
  storageKey: string;
};

export function ImageUploadField({
  value,
  onChange,
  ownerType = "admin",
  ownerId,
  label = "Image",
  aspectRatio = "video",
  maxSizeMB = 5,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showExisting, setShowExisting] = useState(false);
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
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
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WebP, GIF).");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be smaller than ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);
    setError("");

    try {
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

      if (!url) throw new Error("No URL returned from server");
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const aspectClass = aspectRatio === "square" ? "aspect-square" : "aspect-video";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-[var(--nx-text-muted-updated)] uppercase tracking-wide">
        {label}
      </label>

      {/* Preview */}
      {value ? (
        <div
          className={`relative ${aspectClass} max-w-md rounded-lg overflow-hidden border border-[var(--nx-border-updated)] bg-[var(--nx-bg-base-deep)]`}
        >
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-700 transition"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          className={`${aspectClass} max-w-md rounded-lg border-2 border-dashed border-[var(--nx-border-updated)] flex flex-col items-center justify-center text-[var(--nx-text-muted-updated)] bg-[var(--nx-bg-base-deep)]/50`}
        >
          <ImageIcon size={32} />
          <p className="text-xs mt-2">No image selected</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-[var(--nx-accent)] text-black text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {uploading ? "Uploading..." : value ? "Replace Image" : "Upload Image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
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

      {/* Manual URL fallback */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] text-[var(--nx-text-muted-updated)] uppercase">
          Or enter URL manually:
        </p>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-[var(--nx-bg-base-deep)] text-[var(--nx-text-primary)] border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm focus:border-[var(--nx-accent)] outline-none"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Existing Media Modal */}
      {showExisting && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--nx-border-updated)]">
              <h3 className="text-lg font-bold text-[var(--nx-text-primary)]">
                Choose Existing Image
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
                  {existingMedia.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onChange(m.url);
                        setShowExisting(false);
                      }}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                        value === m.url
                          ? "border-[var(--nx-accent)]"
                          : "border-[var(--nx-border-updated)] hover:border-[var(--nx-accent)]"
                      }`}
                    >
                      <img
                        src={m.url}
                        alt={m.storageKey}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
