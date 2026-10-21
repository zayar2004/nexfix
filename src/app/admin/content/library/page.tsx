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
};

const emptyForm = {
  slug: "", title: "", summary: "", body: "", type: "article", category: "", coverImageUrl: "",
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
    } catch (err) {
      setMessage({ text: "Network error", type: "error" });
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
    fetch(`/api/admin/library?id=${editId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) throw new Error(data.error);
        const { article, contents } = data.data;
        // Content ရှိရင် ပထမဆုံးတစ်ခုကို ယူမယ် (en/my မခွဲဘူး)
        const content = contents[0] || {};
        setForm({
          slug: article.slug || "",
          title: content.title || "",
          summary: content.summary || "",
          body: content.body || "",
          type: (article as any).type || "article",
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

      // ရိုးရိုးစာသားကို HTML <p> အနေနဲ့ အလိုအလျောက် ပြောင်းပေးမယ်
      let formattedBody = payload.body;
      if (formattedBody && !formattedBody.includes("<")) {
        formattedBody = `<p>${formattedBody.replace(/\n/g, "</p><p>")}</p>`;
      }

      // API ကို နှစ်ဘာသာလုံး အတူတူ ပို့ပေးလိုက်မယ်
      const apiPayload = {
        slug: payload.slug,
        type: payload.type,
        category: payload.category,
        coverImageUrl: payload.coverImageUrl,
        titleEn: payload.title, titleMy: payload.title,
        summaryEn: payload.summary, summaryMy: payload.summary,
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">{editId ? "Edit Article" : "New Article"}</h1>
        <Link href="/library" target="_blank" className="px-4 py-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] text-white text-sm rounded-lg">
          <ExternalLink size={16} className="inline mr-1" /> View User Library
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-5 mb-6 flex flex-col gap-3">
        {fetchingEdit ? (
          <p className="text-center text-white py-6">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Slug (URL name)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
              <input type="text" placeholder="Category (Optional)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />
            </div>

            <input type="text" placeholder="Title (English သို့မဟုတ် မြန်မာ ရိုက်ပါ)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
            <textarea placeholder="Short Summary (Optional)" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />
            <textarea placeholder="Main Body (ရိုးရိုးစာသား ရိုက်ပါ)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={8} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
            <input type="url" placeholder="Cover Image URL (Optional)" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />

            {editId ? (
              <div className="border-t border-[var(--nx-border-updated)] pt-4 mt-2 flex flex-col gap-4">
                <div><h3 className="text-sm font-bold text-white mb-2">Images</h3><MediaManager ownerType="article" ownerId={editId} /></div>
                <div><h3 className="text-sm font-bold text-white mb-2">Videos</h3><VideoManager ownerType="article" ownerId={editId} /></div>
              </div>
            ) : (
              <p className="text-xs text-[var(--nx-text-muted-updated)] italic border-t border-[var(--nx-border-updated)] pt-3">💡 Save လုပ်ပြီးမှ ပုံ/ဗီဒီယို ထည့်နိုင်ပါမည်။</p>
            )}

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
            <div key={a.id} className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
              <p className="font-semibold text-white truncate">{a.slug}</p>
              <p className="text-xs text-gray-400 truncate">{a.category || "Uncategorized"}</p>
              <div className="flex gap-2 mt-3">
                <Link href={`/admin/content/library?id=${a.id}`} className="flex-1 py-2 text-center bg-[var(--nx-bg-base-deep)] text-white text-xs rounded">Edit</Link>
                <Link href={`/library/${a.slug}`} target="_blank" className="flex-1 py-2 text-center bg-[var(--nx-bg-base-deep)] text-white text-xs rounded">View</Link>
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
