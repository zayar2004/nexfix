"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminLang } from "@/lib/admin-lang-context";

export const dynamic = "force-dynamic";

type Article = {
  id: string;
  slug: string;
  status: string;
  category?: string | null;
  coverImageUrl?: string | null;
};

export default function AdminLibraryPage() {
  const { t } = useAdminLang();
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

      setMessage("✅ " + (t("saveArticle") || "Saved"));
      setForm({ slug: "", titleEn: "", titleMy: "", summaryEn: "", summaryMy: "", bodyEn: "", bodyMy: "", category: "", coverImageUrl: "" });
      fetchArticles();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  return (
    <AdminLayout title={t("libraryTitle")}>
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-5 mb-6 flex flex-col gap-3">
          <h2 className="text-lg font-bold text-white mb-2">{t("addArticle")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder={t("slug")} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
            <input type="text" placeholder={t("category")} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder={t("titleEn")} value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
            <input type="text" placeholder={t("titleMy")} value={form.titleMy} onChange={(e) => setForm({ ...form, titleMy: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <textarea placeholder={t("summaryEn")} value={form.summaryEn} onChange={(e) => setForm({ ...form, summaryEn: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />
            <textarea placeholder={t("summaryMy")} value={form.summaryMy} onChange={(e) => setForm({ ...form, summaryMy: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <textarea placeholder={t("bodyEn")} value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={4} required />
            <textarea placeholder={t("bodyMy")} value={form.bodyMy} onChange={(e) => setForm({ ...form, bodyMy: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={4} required />
          </div>

          <input type="url" placeholder={t("coverImage")} value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />

          <button type="submit" className="py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg">{t("saveArticle")}</button>
          {message && <p className="text-center text-sm">{message}</p>}
        </form>

        <h2 className="text-lg font-bold text-white mb-3">{t("existingArticles")} ({articles.length})</h2>
        {loading ? <p className="text-white">{t("saving")}</p> : (
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
