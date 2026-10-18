"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";

type Article = { id: string; slug: string; status: string };

export default function AdminLibraryPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
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
    
    const method = isEditing ? "PATCH" : "POST";
    const body = isEditing ? { id: editId, ...form } : form;

    try {
      const res = await fetch("/api/admin/library", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      
      setMessage(isEditing ? "✅ Article updated!" : "✅ Article added!");
      setForm({ slug: "", titleEn: "", titleMy: "", bodyEn: "", bodyMy: "" });
      setIsEditing(false);
      setEditId(null);
      fetchArticles();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const handleEdit = (a: Article) => {
    setIsEditing(true);
    setEditId(a.id);
    // Note: Full article content needs fetching. For now, just slug is editable.
    setForm({ slug: a.slug, titleEn: "", titleMy: "", bodyEn: "", bodyMy: "" });
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

  return (
    <AdminLayout title="Knowledge Library">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6 flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">{isEditing ? "Edit Article" : "Add New Article"}</h2>
          
          <input type="text" placeholder="Slug (e.g., fix-monitor-error)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" required />
          
          <div className="border-t border-[var(--nx-border-updated)] my-2"></div>
          <p className="text-sm font-medium text-[var(--nx-text-muted-updated)]">English Content</p>
          <input type="text" placeholder="Title (EN)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />
          <textarea placeholder="Body (EN)" value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={4} />

          <div className="border-t border-[var(--nx-border-updated)] my-2"></div>
          <p className="text-sm font-medium text-[var(--nx-text-muted-updated)]">Myanmar Content</p>
          <input type="text" placeholder="Title (MY)" value={form.titleMy} onChange={(e) => setForm({ ...form, titleMy: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" />
          <textarea placeholder="Body (MY)" value={form.bodyMy} onChange={(e) => setForm({ ...form, bodyMy: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3" rows={4} />
          
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg">{isEditing ? "Update Article" : "Add Article"}</button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setEditId(null); setForm({ slug: "", titleEn: "", titleMy: "", bodyEn: "", bodyMy: "" }); }} className="px-4 py-3 bg-[var(--nx-bg-surface-deep)] text-white rounded-lg">Cancel</button>
            )}
          </div>
          {message && <p className="text-center text-sm">{message}</p>}
        </form>

        <h2 className="text-lg font-semibold text-white mb-3">Existing Articles ({articles.length})</h2>
        {loading ? <p className="text-white">Loading...</p> : (
          <div className="flex flex-col gap-2">
            {articles.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <div>
                  <p className="font-semibold text-white">{a.slug}</p>
                  <p className="text-sm text-[var(--nx-text-muted-updated)]">{a.status}</p>
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
