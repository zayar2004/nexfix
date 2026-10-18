"use client";

import { useState, useEffect, useCallback } from "react";

type Video = {
  id: string;
  youtubeUrl: string;
  title: string | null;
};

export function VideoManager({ ownerType, ownerId }: { ownerType: "error" | "article"; ownerId: string }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ youtubeUrl: "", title: "" });
  const [message, setMessage] = useState("");

  const fetchVideos = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/videos?ownerType=${ownerType}&ownerId=${ownerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setVideos(data.data);
        setLoading(false);
      });
  }, [ownerType, ownerId]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerType, ownerId, ...form }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setForm({ youtubeUrl: "", title: "" });
      fetchVideos();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this video?")) return;
    await fetch(`/api/admin/videos?id=${id}`, { method: "DELETE" });
    fetchVideos();
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-white">YouTube Videos</h3>
      
      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={form.youtubeUrl}
          onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
          className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="Video Title (Optional)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm"
        />
        <button type="submit" className="px-3 py-2 bg-[var(--nx-accent)] text-black font-semibold rounded-lg text-sm">
          + Add Video
        </button>
      </form>

      {message && <p className="text-xs text-center">{message}</p>}

      {loading ? (
        <p className="text-xs text-[var(--nx-text-muted-updated)]">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-xs text-[var(--nx-text-muted-updated)]">No videos added yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {videos.map((v) => (
            <div key={v.id} className="flex items-center justify-between p-2 bg-[var(--nx-bg-surface-deep)] rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{v.title || "Untitled"}</p>
                <p className="text-[10px] text-[var(--nx-text-muted-updated)] truncate">{v.youtubeUrl}</p>
              </div>
              <button onClick={() => handleDelete(v.id)} className="ml-2 text-xs text-[var(--nx-error)] hover:underline">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
