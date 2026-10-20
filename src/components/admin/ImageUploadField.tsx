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

export function ImageUploadField({
  value,
  onChange,
  ownerType = "admin",
  ownerId,
  label = "Image",
  aspectRatio = "video",
  maxSizeMB = 10,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WebP, etc.).");
      return;
    }

    // Validate size
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

      // Try to extract URL from various possible response shapes
      const url =
        data.data?.url ||
        (data.data?.storageKey
          ? `${process.env.NEXT_PUBLIC_S3_URL}/${data.data.storageKey}`
          : "") ||
        data.url ||
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
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
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
    </div>
  );
}
