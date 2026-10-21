"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus, Video } from "lucide-react";

type VideoItem = {
  id: string;
  youtubeUrl: string;
  title: string | null;
};

export function VideoManager({ ownerType, ownerId }: { ownerType: "error" | "article"; ownerId: string }) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ youtubeUrl: "", title: "" });
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

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

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Page မလန်းအောင် တား
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
      setShowForm(false);
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
      {loading ? (
        <p className="text-sm text-[var(--nx-text-muted-updated)]">Loading videos...</p>
      ) : videos.length === 0 ? (
        <p className="text-xs text-[var(--nx-text-muted-updated)] italic">No videos added yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {videos.map((v) => (
            <div key={v.id} className="flex items-center justify-between p-2 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <Video size={16} className="text-[var(--nx-cyan)] flex-shrink-0" />
                <span className="text-sm text-white truncate">{v.title || v.youtubeUrl}</span>
              </div>
              <button type="button" onClick={() => handleDelete(v.id)} className="p-1 text-red-400 hover:text-red-300 transition-colors flex-shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <button 
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full py-2 bg-[var(--nx-bg-base-deep)] border border-dashed border-[var(--nx-border-updated)] text-[var(--nx-text-muted-updated)] text-sm rounded-lg hover:border-[var(--nx-cyan)] transition flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add Video
        </button>
      ) : (
        <form onSubmit={handleAdd} className="flex flex-col gap-2 p-3 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-cyan)]/30 rounded-lg">
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.youtubeUrl}
            onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
            className="w-full bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm focus:border-[var(--nx-cyan)] outline-none"
            required
          />
          <input
            type="text"
            placeholder="Video Title (Optional)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm focus:border-[var(--nx-cyan)] outline-none"
          />
          <div className="flex gap-2">
            {/* ဒီ Button ကို type="button" ပြောင်းပြီး နှိပ်ရင် handleAdd ကို ခေါ်မယ် */}
            <button 
              type="button" 
              onClick={() => handleAdd()} 
              className="flex-1 py-2 bg-[var(--nx-cyan)] text-black text-sm font-bold rounded-lg hover:opacity-90 transition"
            >
              Save Video
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-[var(--nx-bg-card)] text-white text-sm border border-[var(--nx-border-updated)] rounded-lg hover:border-red-500/50 transition">
              Cancel
            </button>
          </div>
          {message && <p className="text-xs text-red-400 text-center">{message}</p>}
        </form>
      )}
    </div>
  );
}
