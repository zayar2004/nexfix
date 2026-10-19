"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";

type Article = {
  id: string;
  slug: string;
  status: string;
  category?: string | null;
  coverImageUrl?: string | null;
};

type VideoItem = { url: string; title: string; order: number };

type ArticleDetail = {
  article: Article;
  contents: Array<{ locale: string; title: string; body: string; summary?: string | null }>;
  videos: Array<{ youtubeUrl: string; title?: string | null; displayOrder: string }>;
};

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]{11}([&\?].*)?$/;

function isValidYouTube(url: string): boolean {
  return YOUTUBE_REGEX.test(url);
}

export default function AdminLibraryPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // အခုတော့ Title နဲ့ Body ကို တစ်ခုတည်း (Single Field) ပဲ သုံးပါမယ်
  const [form, setForm] = useState({
    slug: "",
    title: "",
    body: "",
    summary: "",
    category: "",
    coverImageUrl: "",
  });

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videoError, setVideoError] = useState("");

  const fetchArticles = () => {
    fetch("/api/admin/library")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setArticles(data.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const resetForm = () => {
    setForm({ slug: "", title: "", body: "", summary: "", category: "", coverImageUrl: "" });
    setVideos([]);
    setIsEditing(false);
    setEditId(null);
    setVideoError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setVideoError("");

    for (const v of videos) {
      if (v.url && !isValidYouTube(v.url)) {
        setVideoError(`Invalid YouTube URL: ${v.url}`);
        return;
      }
    }

    // API က titleEn/My ဆိုပြီး နှစ်ခုလိုချင်နေလို့ တူညီတဲ့စာသားကို နှစ်နေရာလုံးမှာ ထည့်ပေးလိုက်ပါမယ် (နောက်ပိုင်း လိုအပ်ရင် ခွဲလို့ရပါတယ်)
    const payload = {
      ...form,
      titleEn: form.title,
      titleMy: form.title,
      bodyEn: form.body,
      bodyMy: form.body,
      summaryEn: form.summary,
      summaryMy: form.summary,
      videos: videos.filter((v) => v.url),
    };

    const method = isEditing ? "PATCH" : "POST";
    const body = isEditing ? { id: editId, ...payload } : payload;

    try {
      const res = await fetch("/api/admin/library", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      setMessage(isEditing ? "✅ Article updated!" : "✅ Article added!");
      resetForm();
      fetchArticles();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const handleEdit = async (a: Article) => {
    setIsEditing(true);
    setEditId(a.id);
    setLoadingDetail(true);
    setMessage("");
    setVideoError("");

    try {
      const res = await fetch(`/api/admin/library?id=${a.id}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      const detail: ArticleDetail = data.data;
      // မြန်မာစာကို ဦးစားပေးယူမယ်၊ မရှိရင် အင်္ဂလိပ်စာယူမယ်
      const content = detail.contents.find(c => c.locale === "my") || detail.contents.find(c => c.locale === "en");

      setForm({
        slug: detail.article.slug,
        title: content?.title || "",
        body: content?.body || "",
        summary: content?.summary || "",
        category: detail.article.category || "",
        coverImageUrl: detail.article.coverImageUrl || "",
      });

      setVideos(detail.videos.map((v) => ({
        url: v.youtubeUrl,
        title: v.title || "",
        order: Number(v.displayOrder) || 0,
      })));
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/library?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage("✅ Article deleted!");
      fetchArticles();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const addVideo = () => {
    setVideos([...videos, { url: "", title: "", order: videos.length }]);
  };

  const updateVideo = (i: number, field: keyof VideoItem, value: string | number) => {
    const updated = [...videos];
    updated[i] = { ...updated[i], [field]: value };
    setVideos(updated);
  };

  const removeVideo = (i: number) => {
    setVideos(videos.filter((_, idx) => idx !== i));
  };

  const inputClass = "bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3";
  const sectionClass = "border-t border-[var(--nx-border-updated)] my-2";

  return (
    <AdminLayout title="Knowledge Library">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6 flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">{isEditing ? "Edit Article" : "Add New Article"}</h2>

          {loadingDetail && <p className="text-sm text-[var(--nx-text-muted-updated)]">Loading article...</p>}

          <input type="text" placeholder="Slug (e.g., fix-monitor-error)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} required />

          <div className={sectionClass}></div>
          
          <p className="text-sm font-medium text-[var(--nx-text-muted-updated)]">Article Content (Myanmar or English)</p>
          
          <input type="text" placeholder="Title (မြန်မာ သို့မဟုတ် English ရိုက်နိုင်သည်)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} required />
          
          <textarea placeholder="Short Summary (အကျဉ်းချုပ် - မဖြစ်မနေ မလိုပါ)" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={inputClass} rows={2} />
          
          <textarea placeholder="Full Body (အသေးစိတ် အကြောင်းအရာ)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className={inputClass} rows={6} required />

          <div className={sectionClass}></div>
          <p className="text-sm font-medium text-[var(--nx-text-muted-updated)]">Metadata</p>
          <input type="text" placeholder="Category (e.g., Monitor, Power)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
          <input type="text" placeholder="Cover Image URL" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className={inputClass} />

          <div className={sectionClass}></div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--nx-text-muted-updated)]">YouTube Videos ({videos.length})</p>
            <button type="button" onClick={addVideo} className="px-3 py-1.5 text-xs font-medium bg-[var(--nx-bg-surface-deep)] text-white rounded-lg hover:bg-[var(--nx-bg-elevated-deep)]">+ Add Video</button>
          </div>

          {videos.map((v, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 bg-[var(--nx-bg-base-deep)] rounded-lg border border-[var(--nx-border-updated)]">
              <div className="flex gap-2">
                <input type="number" placeholder="Order" value={v.order} onChange={(e) => updateVideo(i, "order", Number(e.target.value))} className="w-20 bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded p-2 text-sm" />
                <input type="text" placeholder="Title (optional)" value={v.title} onChange={(e) => updateVideo(i, "title", e.target.value)} className="flex-1 bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded p-2 text-sm" />
                <button type="button" onClick={() => removeVideo(i)} className="px-3 py-2 text-xs bg-[var(--nx-error)]/10 text-[var(--nx-error)] border border-[var(--nx-error)]/30 rounded">✕</button>
              </div>
              <input type="text" placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..." value={v.url} onChange={(e) => updateVideo(i, "url", e.target.value)} className="bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded p-2 text-sm" />
            </div>
          ))}

          {videoError && <p className="text-sm text-[var(--nx-error)]">{videoError}</p>}

          <div className="flex gap-2 mt-2">
            <button type="submit" className="flex-1 py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg">{isEditing ? "Update Article" : "Add Article"}</button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="px-4 py-3 bg-[var(--nx-bg-surface-deep)] text-white rounded-lg">Cancel</button>
            )}
          </div>
          {message && <p className="text-center text-sm">{message}</p>}
        </form>

        <h2 className="text-lg font-semibold text-white mb-3">Existing Articles ({articles.length})</h2>
        {loading ? <p className="text-white">Loading...</p> : (
          <div className="flex flex-col gap-2">
            {articles.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <div>
                  <p className="font-semibold text-white">{a.slug}</p>
                  <p className="text-sm text-[var(--nx-text-muted-updated)]">{a.status}{a.category ? ` · ${a.category}` : ""}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(a)} className="px-3 py-1.5 text-xs font-medium bg-[var(--nx-bg-surface-deep)] text-white rounded-lg hover:bg-[var(--nx-bg-elevated-deep)]">Edit</button>
                  <button onClick={() => handleDelete(a.id)} className="px-3 py-1.5 text-xs font-medium bg-[var(--nx-error)]/10 text-[var(--nx-error)] border border-[var(--nx-error)]/30 rounded-lg hover:bg-[var(--nx-error)]/20">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
