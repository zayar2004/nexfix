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

export default function AdminLibraryPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    slug: "", titleEn: "", titleMy: "", summaryEn: "", summaryMy: "", bodyEn: "", bodyMy: "", category: "", coverImageUrl: ""
  });

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/library");
      const data = await res.json();
      if (data.ok) setArticles(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/admin/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      setMessage("✅ Article saved successfully!");
      setForm({ slug: "", titleEn: "", titleMy: "", summaryEn: "", summaryMy: "", bodyEn: "", bodyMy: "", category: "", coverImageUrl: "" });
      fetchArticles();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  return (
    <AdminLayout title="Knowledge Library">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-5 mb-6 flex flex-col gap-3">
          <h2 className="text-lg font-bold text-white mb-2">Add New Article</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Slug (URL name)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
            <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Title (English)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
            <input type="text" placeholder="Title (Myanmar)" value={form.titleMy} onChange={(e) => setForm({ ...form, titleMy: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <textarea placeholder="Summary (English)" value={form.summaryEn} onChange={(e) => setForm({ ...form, summaryEn: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />
            <textarea placeholder="Summary (Myanmar)" value={form.summaryMy} onChange={(e) => setForm({ ...form, summaryMy: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <textarea placeholder="Body (English)" value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={4} required />
            <textarea placeholder="Body (Myanmar)" value={form.bodyMy} onChange={(e) => setForm({ ...form, bodyMy: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={4} required />
          </div>

          <input type="url" placeholder="Cover Image URL" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />

          <button type="submit" className="py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg">Save Article</button>
          {message && <p className="text-center text-sm">{message}</p>}
        </form>

        <h2 className="text-lg font-bold text-white mb-3">Existing Articles ({articles.length})</h2>
        {loading ? <p className="text-white">Loading...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {articles.map(a => (
              <div key={a.id} className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <p className="font-semibold text-white">{a.slug}</p>
                <p className="text-xs text-[var(--nx-text-muted-updated)] mt-1">{a.category || "Uncategorized"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
