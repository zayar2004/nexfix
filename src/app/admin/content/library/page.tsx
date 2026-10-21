"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MediaManager } from "@/components/admin/MediaManager";
import { VideoManager } from "@/components/admin/VideoManager";
import { Plus, Edit, Trash2, Eye, Save, X, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

type Article = {
  id: string;
  slug: string;
  status: string;
  category?: string | null;
  coverImageUrl?: string | null;
  title?: string | null;
};

type Machine = {
  id: string;
  name: string;
};

const emptyForm = {
  title: "", body: "", type: "article", status: "published", category: "", coverImageUrl: "", machineId: "",
};

function AdminLibraryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");

  const [articles, setArticles] = useState<Article[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
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
    } catch (err) {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await fetch("/api/admin/machines");
      const data = await res.json();
      if (data.ok) setMachines(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { 
    fetchArticles(); 
    fetchMachines();
  }, []);

  useEffect(() => {
    if (!editId) {
      setForm({ ...emptyForm });
      return;
    }
    setFetchingEdit(true);
    fetch(`/api/admin/library?id=${editId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) throw new Error(data.error);
        const { article, contents } = data.data;
        const content = contents[0] || {};
        setForm({
          title: content.title || "",
          body: content.body || "",
          type: (article as any).type || "article",
          status: (article as any).status || "published",
          machineId: (article as any).machineId || "",
          category: article.category || "",
          coverImageUrl: article.coverImageUrl || "",
        });
      })
      .catch((err) => setMessage({ text: err.message, type: "error" }))
      .finally(() => setFetchingEdit(false));
  }, [editId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const url = "/api/admin/library";
      const method = editId ? "PATCH" : "POST";
      const payload: any = { ...form };
      if (editId) payload.id = editId;

      let formattedBody = payload.body;
      if (formattedBody && !formattedBody.includes("<")) {
        formattedBody = `<p>${formattedBody.replace(/\n/g, "</p><p>")}</p>`;
      }

      const apiPayload = {
        type: payload.type,
        status: payload.status,
        machineId: payload.machineId || undefined,
        category: payload.category,
        coverImageUrl: payload.coverImageUrl,
        titleEn: payload.title, titleMy: payload.title,
        bodyEn: formattedBody, bodyMy: formattedBody,
        ...(editId ? { id: editId } : {})
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      
      setMessage({ text: editId ? "✅ Article updated!" : "✅ Article created!", type: "success" });
      
      if (!editId) {
        const newId = data.data?.id;
        if (newId) {
          router.push(`/admin/content/library?id=${newId}`);
        } else {
          setForm({ ...emptyForm });
          fetchArticles();
        }
      } else {
        router.push("/admin/content/library");
      }
    } catch (err) {
      setMessage({ text: "❌ " + (err instanceof Error ? err.message : "Error"), type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">{editId ? "Edit Article" : "New Article"}</h1>
        <Link href="/library" target="_blank" className="px-4 py-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] text-white text-sm rounded-lg flex items-center gap-1.5">
          <ExternalLink size={16} /> View User Library
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-5 mb-6 flex flex-col gap-3">
        {fetchingEdit ? (
          <p className="text-center text-white py-6">Loading...</p>
        ) : (
          <>
            <input type="text" placeholder="Title (English သို့မဟုတ် မြန်မာ ရိုက်ပါ)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3"
              >
                <option value="article">Article / Guide</option>
                <option value="troubleshooting">Troubleshooting</option>
                <option value="maintenance">Maintenance</option>
                <option value="video">Video Tutorial</option>
                <option value="manual">PDF Manual</option>
                <option value="safety">Safety Notice</option>
              </select>

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3"
              >
                <option value="published">Published (အားလုံးမြင်နိုင်)</option>
                <option value="draft">Draft (မပေါ်သေးပါ)</option>
                <option value="archived">Archived (ဖျောက်ထားမည်)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={form.machineId}
                onChange={(e) => setForm({ ...form, machineId: e.target.value })}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3"
              >
                <option value="">-- No Machine --</option>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Category (Optional)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3"
              />
            </div>

            <textarea placeholder="Main Body (ရိုးရိုးစာသား ရိုက်ပါ)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={8} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
            
            <input type="url" placeholder="Cover Image URL (Optional)" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />

            <div className="border-t border-[var(--nx-border-updated)] pt-4 mt-2 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Images</h3>
                {editId ? (
                  <MediaManager ownerType="article" ownerId={editId} />
                ) : (
                  <p className="text-xs text-[var(--nx-text-muted-updated)] italic bg-[var(--nx-bg-base-deep)] p-3 rounded-lg border border-[var(--nx-border-updated)]">
                    💡 Article ကို Save လုပ်ပြီးတာနဲ့ ဒီနေရာမှာ ပုံတွေ ထည့်နိုင်ပါပြီ။
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Videos</h3>
                {editId ? (
                  <VideoManager ownerType="article" ownerId={editId} />
                ) : (
                  <p className="text-xs text-[var(--nx-text-muted-updated)] italic bg-[var(--nx-bg-base-deep)] p-3 rounded-lg border border-[var(--nx-border-updated)]">
                    💡 Article ကို Save လုပ်ပြီးတာနဲ့ ဒီနေရာမှာ ဗီဒီယိုတွေ ထည့်နိုင်ပါပြီ။
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg disabled:opacity-50">
                {submitting ? "Saving..." : editId ? "Update Article" : "Save Article"}
              </button>
              {editId && (
                <button type="button" onClick={() => router.push("/admin/content/library")} className="px-5 py-3 bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg">Cancel</button>
              )}
            </div>
            {message && <p className={`text-center text-sm p-2 rounded ${message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{message.text}</p>}
          </>
        )}
      </form>

      <h2 className="text-lg font-bold text-white mb-3">Existing Articles ({articles.length})</h2>
      {loading ? <p className="text-white">Loading...</p> : articles.length === 0 ? <p className="text-gray-400">No articles.</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {articles.map((a) => (
            <div key={a.id} className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-white truncate text-sm">{a.title || a.slug}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    a.status === 'published' ? 'text-green-400 border-green-400/30 bg-green-400/10' : 
                    a.status === 'draft' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' : 
                    'text-gray-400 border-gray-400/30 bg-gray-400/10'
                  }`}>
                    {a.status}
                  </span>
                </div>
                <p className="text-xs text-[var(--nx-cyan)] truncate mb-1">{a.category || "Uncategorized"}</p>
                <p className="text-[10px] text-gray-500 truncate">/{a.slug}</p>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--nx-border-updated)]">
                <Link href={`/admin/content/library?id=${a.id}`} className="flex-1 py-1.5 text-center bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] text-white text-xs rounded hover:border-[var(--nx-cyan)] transition">Edit</Link>
                <Link href={`/library/${a.slug}`} target="_blank" className="flex-1 py-1.5 text-center bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] text-white text-xs rounded hover:border-[var(--nx-cyan)] transition">View</Link>
                <button onClick={() => handleDelete(a.id)} className="py-1.5 px-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded hover:bg-red-500/20 transition flex items-center justify-center">
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
