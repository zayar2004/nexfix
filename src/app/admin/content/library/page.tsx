"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Article = { id: string; slug: string; status: string };

export default function AdminLibraryPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  const [form, setForm] = useState({
    slug: "", titleEn: "", titleMy: "", bodyEn: "", bodyMy: ""
  });

  const fetchArticles = () => {
    fetch("/api/admin/library").then(res => res.json()).then(data => {
      if (data.ok) setArticles(data.data);
      setLoading(false);
    });
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
      setMessage("✅ Article added!");
      setForm({ slug: "", titleEn: "", titleMy: "", bodyEn: "", bodyMy: "" });
      fetchArticles();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Manage Knowledge Library</h1>
          <button onClick={() => router.push("/admin")} className="text-sm text-[var(--nx-accent)]">← Back</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6 flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">Add New Article</h2>
          
          <input type="text" placeholder="Slug (e.g., fix-monitor-error)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          
          <div className="border-t border-[var(--nx-border-updated)] my-2"></div>
          <p className="text-sm font-medium text-[var(--nx-text-muted-updated)]">English Content</p>
          <input type="text" placeholder="Title (EN)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          <textarea placeholder="Body (EN)" value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={4} required />

          <div className="border-t border-[var(--nx-border-updated)] my-2"></div>
          <p className="text-sm font-medium text-[var(--nx-text-muted-updated)]">Myanmar Content</p>
          <input type="text" placeholder="Title (MY)" value={form.titleMy} onChange={(e) => setForm({ ...form, titleMy: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          <textarea placeholder="Body (MY)" value={form.bodyMy} onChange={(e) => setForm({ ...form, bodyMy: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={4} required />
          
          <button type="submit" className="py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg">Add Article</button>
          {message && <p className="text-center text-sm">{message}</p>}
        </form>

        <h2 className="text-lg font-semibold text-white mb-3">Existing Articles</h2>
        {loading ? <p className="text-white">Loading...</p> : (
          <div className="flex flex-col gap-2">
            {articles.map(a => (
              <div key={a.id} className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <p className="font-semibold text-white">{a.slug}</p>
                <p className="text-sm text-[var(--nx-text-muted-updated)]">{a.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
