"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Edit, Trash2, Eye, CheckSquare, Square, Plus, Search } from "lucide-react";

type Article = {
  id: string;
  slug: string;
  status: string;
  type?: string | null;
  category?: string | null;
  coverImageUrl?: string | null;
  title?: string | null;
};

export default function LibraryListPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    fetchArticles();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredArticles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredArticles.map((a) => a.id));
    }
  };

  const handleDeleteSingle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      const res = await fetch(`/api/admin/library?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage("✅ Article deleted.");
      fetchArticles();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected articles? This cannot be undone.`)) return;
    
    setDeleting(true);
    setMessage("");
    try {
      for (const id of selectedIds) {
        await fetch(`/api/admin/library?id=${id}`, { method: "DELETE" });
      }
      setMessage(`✅ Deleted ${selectedIds.length} articles.`);
      setSelectedIds([]);
      fetchArticles();
    } catch (err) {
      setMessage("❌ Error deleting some articles.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredArticles = articles.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.title && a.title.toLowerCase().includes(q)) ||
      a.slug.toLowerCase().includes(q) ||
      (a.category && a.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Library Content List</h1>
          <p className="text-sm text-[var(--nx-text-muted-updated)] mt-1">Manage all knowledge articles.</p>
        </div>
        <Link href="/admin/content/library" className="px-4 py-2 bg-[var(--nx-accent)] text-black text-sm font-bold rounded-lg flex items-center gap-1.5 hover:opacity-90 transition">
          <Plus size={16} /> Add New Article
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nx-text-muted-updated)]" size={16} />
          <input
            type="text"
            placeholder="Search by title, slug, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg py-2 pl-9 pr-3 text-sm focus:border-[var(--nx-cyan)] outline-none"
          />
        </div>
        
        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/20 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Trash2 size={16} /> Delete Selected ({selectedIds.length})
          </button>
        )}
        
        <button
          onClick={toggleSelectAll}
          className="px-4 py-2 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] text-white text-sm font-medium rounded-lg hover:border-[var(--nx-cyan)] transition flex items-center gap-1.5"
        >
          {selectedIds.length === filteredArticles.length && filteredArticles.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
          Select All
        </button>
      </div>

      {message && (
        <p className="text-center text-sm p-3 rounded-lg mb-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)]">{message}</p>
      )}

      {/* List */}
      {loading ? (
        <p className="text-center text-white py-10">Loading...</p>
      ) : filteredArticles.length === 0 ? (
        <div className="p-10 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">
          No articles found.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredArticles.map((a) => (
            <div
              key={a.id}
              className={`flex items-center gap-3 p-3 bg-[var(--nx-bg-card)] border rounded-xl transition ${
                selectedIds.includes(a.id) ? "border-[var(--nx-cyan)] bg-[var(--nx-cyan)]/5" : "border-[var(--nx-border-updated)]"
              }`}
            >
              {/* Checkbox */}
              <button onClick={() => toggleSelect(a.id)} className="p-1 text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-cyan)]">
                {selectedIds.includes(a.id) ? <CheckSquare size={20} className="text-[var(--nx-cyan)]" /> : <Square size={20} />}
              </button>

              {/* Cover */}
              {a.coverImageUrl ? (
                <img src={a.coverImageUrl} alt="" className="w-12 h-12 object-cover rounded-lg border border-[var(--nx-border-updated)] flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] rounded-lg flex-shrink-0" />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white text-sm truncate">{a.title || a.slug}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    a.status === "published" ? "text-green-400 border-green-400/30 bg-green-400/10" :
                    a.status === "draft" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" :
                    "text-gray-400 border-gray-400/30 bg-gray-400/10"
                  }`}>{a.status}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--nx-text-muted-updated)]">
                  <span className="text-[var(--nx-cyan)]">{a.category || "Uncategorized"}</span>
                  <span>•</span>
                  <span className="truncate">/{a.slug}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0">
                <Link href={`/admin/content/library?id=${a.id}`} className="p-2 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] text-white rounded-lg hover:border-[var(--nx-cyan)] transition">
                  <Edit size={16} />
                </Link>
                <Link href={`/library/${a.slug}`} target="_blank" className="p-2 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] text-white rounded-lg hover:border-[var(--nx-cyan)] transition">
                  <Eye size={16} />
                </Link>
                <button onClick={() => handleDeleteSingle(a.id)} className="p-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
