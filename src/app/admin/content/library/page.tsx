"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MediaManager } from "@/components/admin/MediaManager";
import { VideoManager } from "@/components/admin/VideoManager";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Plus, Edit, Trash2, Eye, Save, X, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

type Article = {
  id: string;
  slug: string;
  status: string;
  category?: string | null;
  coverImageUrl?: string | null;
};

type ArticleDetail = Article & {
  contents: { locale: string; title: string; summary: string | null; body: string }[];
};

const emptyForm = {
  slug: "", titleEn: "", titleMy: "", summaryEn: "", summaryMy: "",
  bodyEn: "", bodyMy: "", category: "", coverImageUrl: "",
};

function AdminLibraryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingEdit, setFetchingEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/library");
      const data = await res.json();
      if (data.ok) setArticles(data.data);
      else setMessage({ text: data.error || "Failed to load", type: "error" });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  useEffect(() => {
    if (!editId) {
      setForm({ ...emptyForm });
      return;
    }
    setFetchingEdit(true);
    setMessage(null);
    fetch(`/api/admin/library?id=${editId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) throw new Error(data.error || "Failed to load article");
        const { article, contents } = data.data as {
          article: Article;
          contents: { locale: string; title: string; summary: string | null; body: string }[];
        };
        const en = contents.find((c) => c.locale === "en");
        const my = contents.find((c) => c.locale === "my");
        setForm({
          slug: article.slug || "",
          titleEn: en?.title || "",
          titleMy: my?.title || "",
          summaryEn: en?.summary || "",
          summaryMy: my?.summary || "",
          bodyEn: en?.body || "",
          bodyMy: my?.body || "",
          category: article.category || "",
          coverImageUrl: article.coverImageUrl || "",
        });
      })
      .catch((err) => setMessage({ text: err.message, type: "error" }))
      .finally(() => setFetchingEdit(false));
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const url = "/api/admin/library";
      const method = editId ? "PATCH" : "POST";
      const payload: any = { ...form };
      if (editId) payload.id = editId;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      setMessage({
        text: editId ? "✅ Article updated successfully!" : "✅ Article created successfully!",
        type: "success",
      });
      if (!editId) {
        setForm({ ...emptyForm });
        fetchArticles();
      } else {
        router.push("/admin/content/library");
      }
    } catch (err) {
      setMessage({ text: "❌ " + (err instanceof Error ? err.message : "Error"), type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/library?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Delete failed");
      setMessage({ text: "✅ Article deleted.", type: "success" });
      fetchArticles();
    } catch (err) {
      setMessage({ text: "❌ " + (err instanceof Error ? err.message : "Error"), type: "error" });
    }
  };

  const cancelEdit = () => {
    router.push("/admin/content/library");
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">
          {editId ? "Edit Article" : "New Article"}
        </h1>
        <Link
          href="/library"
          target="_blank"
          className="px-4 py-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] text-white text-sm font-medium rounded-lg hover:border-[var(--nx-accent)] transition flex items-center gap-1.5"
        >
          <ExternalLink size={16} /> View User Library
        </Link>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-5 mb-6 flex flex-col gap-3"
      >
        {fetchingEdit ? (
          <p className="text-center text-white py-6">Loading article...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Slug (URL name)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Title (English)"
                value={form.titleEn}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none"
                required
              />
              <input
                type="text"
                placeholder="Title (Myanmar)"
                value={form.titleMy}
                onChange={(e) => setForm({ ...form, titleMy: e.target.value })}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <textarea
                placeholder="Summary (English)"
                value={form.summaryEn}
                onChange={(e) => setForm({ ...form, summaryEn: e.target.value })}
                rows={2}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none"
              />
              <textarea
                placeholder="Summary (Myanmar)"
                value={form.summaryMy}
                onChange={(e) => setForm({ ...form, summaryMy: e.target.value })}
                rows={2}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <textarea
                placeholder="Body (English) — HTML allowed"
                value={form.bodyEn}
                onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
                rows={6}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none"
                required
              />
              <textarea
                placeholder="Body (Myanmar) — HTML allowed"
                value={form.bodyMy}
                onChange={(e) => setForm({ ...form, bodyMy: e.target.value })}
                rows={6}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 focus:border-[var(--nx-accent)] outline-none"
                required
              />
            </div>

            <ImageUploadField
              label="Cover Image"
              value={form.coverImageUrl}
              onChange={(url) => setForm({ ...form, coverImageUrl: url })}
              ownerType="article"
              ownerId={editId || undefined}
              aspectRatio="video"
            />

            {/* Media — Edit mode only */}
            {editId ? (
              <div className="border-t border-[var(--nx-border-updated)] pt-4 mt-2 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">Images</h3>
                  <MediaManager ownerType="article" ownerId={editId} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">YouTube Videos</h3>
                  <VideoManager ownerType="article" ownerId={editId} />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--nx-text-muted-updated)] italic border-t border-[var(--nx-border-updated)] pt-3">
                💡 Save the article first to add images and videos.
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 min-w-[140px] py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {submitting ? "Saving..." : editId ? "Update Article" : "Save Article"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-3 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] text-white font-medium rounded-lg hover:border-red-500/50 flex items-center gap-2"
                >
                  <X size={18} /> Cancel
                </button>
              )}
            </div>

            {message && (
              <p
                className={`text-center text-sm font-medium p-2 rounded flex items-center justify-center gap-2 ${
                  message.type === "success"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </p>
            )}
          </>
        )}
      </form>

      {/* Existing Articles */}
      <h2 className="text-lg font-bold text-white mb-3">
        Existing Articles ({articles.length})
      </h2>

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : articles.length === 0 ? (
        <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">
          No articles yet. Create one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {articles.map((a) => (
            <div
              key={a.id}
              className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl"
            >
              <div className="flex gap-3">
                {a.coverImageUrl && (
                  <img
                    src={a.coverImageUrl}
                    alt=""
                    className="w-16 h-16 object-cover rounded border border-[var(--nx-border-updated)] flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{a.slug}</p>
                  <p className="text-xs text-[var(--nx-text-muted-updated)] truncate">
                    {a.category || "Uncategorized"}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-500/15 text-green-400">
                    {a.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Link
                  href={`/admin/content/library?id=${a.id}`}
                  className="flex-1 py-2 px-3 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] text-white text-xs font-medium rounded-lg hover:border-[var(--nx-accent)] flex items-center justify-center gap-1"
                >
                  <Edit size={14} /> Edit
                </Link>
                <Link
                  href={`/library/${a.slug}`}
                  target="_blank"
                  className="flex-1 py-2 px-3 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] text-white text-xs font-medium rounded-lg hover:border-[var(--nx-accent)] flex items-center justify-center gap-1"
                >
                  <Eye size={14} /> View
                </Link>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="py-2 px-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLibraryPage() {
  return (
    <AdminLayout title="Knowledge Library">
      <Suspense fallback={<div className="text-white text-center py-10">Loading...</div>}>
        <AdminLibraryContent />
      </Suspense>
    </AdminLayout>
  );
}
