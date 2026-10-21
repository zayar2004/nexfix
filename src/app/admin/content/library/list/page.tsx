"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Trash2, Eye, CheckSquare, Square, Plus, Search, BookOpen, AlertTriangle, Video, Wrench, Monitor, FileText, Filter } from "lucide-react";

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
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

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

  const handleDeleteSingle = (id: string, title: string) => {
    setDeleteTarget({ id, title });
  };

  const confirmDeleteSingle = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/library?id=${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage("✅ Article deleted.");
      setDeleteTarget(null);
      fetchArticles();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
      setDeleteTarget(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setShowBulkDelete(true);
  };

  const confirmBulkDelete = async () => {
    setDeleting(true);
    setMessage("");
    try {
      for (const id of selectedIds) {
        await fetch(`/api/admin/library?id=${id}`, { method: "DELETE" });
      }
      setMessage(`✅ Deleted ${selectedIds.length} articles.`);
      setSelectedIds([]);
      setShowBulkDelete(false);
      fetchArticles();
    } catch (err) {
      setMessage("❌ Error deleting some articles.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredArticles = articles.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.title && a.title.toLowerCase().includes(q)) ||
      a.slug.toLowerCase().includes(q) ||
      (a.category && a.category.toLowerCase().includes(q))
    );
  });

  const getTypeIcon = (type: string | null | undefined) => {
    if (!type) return <BookOpen size={16} />;
    const t = type.toLowerCase();
    if (t.includes("troubleshoot") || t.includes("error")) return <AlertTriangle size={16} />;
    if (t.includes("maintenance") || t.includes("repair")) return <Wrench size={16} />;
    if (t.includes("video")) return <Video size={16} />;
    if (t.includes("machine")) return <Monitor size={16} />;
    if (t.includes("manual")) return <FileText size={16} />;
    return <BookOpen size={16} />;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-[var(--nx-cyan)]" size={28} /> Library Content List
          </h1>
          <p className="text-sm text-[var(--nx-text-muted-updated)] mt-1">Manage all knowledge articles.</p>
        </div>
        <Link href="/admin/content/library" className="px-4 py-2.5 bg-[var(--nx-accent)] text-black text-sm font-bold rounded-lg flex items-center gap-1.5 hover:opacity-90 transition shadow-lg">
          <Plus size={18} /> Add New Article
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3 shadow-md">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nx-text-muted-updated)]" size={16} />
          <input
            type="text"
            placeholder="Search by title, slug, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg py-2.5 pl-9 pr-3 text-sm focus:border-[var(--nx-cyan)] outline-none transition"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg text-sm focus:border-[var(--nx-cyan)] outline-none"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <button
          onClick={toggleSelectAll}
          className="px-4 py-2.5 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] text-white text-sm font-medium rounded-lg hover:border-[var(--nx-cyan)] transition flex items-center gap-1.5"
        >
          {selectedIds.length === filteredArticles.length && filteredArticles.length > 0 ? <CheckSquare size={16} className="text-[var(--nx-cyan)]" /> : <Square size={16} />}
          Select All
        </button>

        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold rounded-lg hover:bg-red-500/20 transition disabled:opacity-50 flex items-center gap-1.5 animate-pulse"
          >
            <Trash2 size={16} /> Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      {message && (
        <p className="text-center text-sm p-3 rounded-lg mb-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)]">{message}</p>
      )}

      {/* List Grid */}
      {loading ? (
        <p className="text-center text-white py-10">Loading...</p>
      ) : filteredArticles.length === 0 ? (
        <div className="p-10 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">
          No articles found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((a) => (
            <div
              key={a.id}
              className={`flex flex-col bg-[var(--nx-bg-card)] border rounded-xl overflow-hidden transition shadow-sm ${
                selectedIds.includes(a.id) ? "border-[var(--nx-cyan)] ring-1 ring-[var(--nx-cyan)]" : "border-[var(--nx-border-updated)] hover:border-[var(--nx-cyan)]"
              }`}
            >
              {/* Cover & Checkbox */}
              <div className="relative h-32 w-full bg-[var(--nx-bg-base-deep)] border-b border-[var(--nx-border-updated)]">
                {a.coverImageUrl ? (
                  <img src={a.coverImageUrl.startsWith("http") ? a.coverImageUrl : `${process.env.NEXT_PUBLIC_S3_URL}/${a.coverImageUrl}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30">
                    <BookOpen size={32} className="text-[var(--nx-text-muted-updated)]" />
                  </div>
                )}
                {/* Checkbox Overlay */}
                <button 
                  onClick={() => toggleSelect(a.id)} 
                  className="absolute top-2 left-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-md text-white hover:bg-black/80 transition"
                >
                  {selectedIds.includes(a.id) ? <CheckSquare size={18} className="text-[var(--nx-cyan)]" /> : <Square size={18} />}
                </button>
                {/* Status Badge */}
                <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-bold border backdrop-blur-md ${
                  a.status === "published" ? "text-green-400 border-green-400/30 bg-green-400/10" :
                  a.status === "draft" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" :
                  "text-gray-400 border-gray-400/30 bg-gray-400/10"
                }`}>{a.status}</span>
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[var(--nx-cyan)] bg-[var(--nx-cyan)]/10 p-1 rounded">
                    {getTypeIcon(a.type)}
                  </span>
                  <span className="text-xs font-semibold text-[var(--nx-cyan)] truncate">{a.category || "Uncategorized"}</span>
                </div>
                <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug mb-1">{a.title || a.slug}</h3>
                <p className="text-[10px] text-[var(--nx-text-muted-updated)] truncate mt-auto pt-2">/{a.slug}</p>
              </div>

              {/* Actions */}
              <div className="flex border-t border-[var(--nx-border-updated)] bg-[var(--nx-bg-base-deep)]/50">
                <Link href={`/admin/content/library?id=${a.id}`} className="flex-1 py-2.5 text-center text-white text-xs font-medium hover:bg-[var(--nx-bg-card)] transition flex items-center justify-center gap-1">
                  <Edit size={14} /> Edit
                </Link>
                <div className="w-px bg-[var(--nx-border-updated)]" />
                <Link href={`/library/${a.slug}`} target="_blank" className="flex-1 py-2.5 text-center text-white text-xs font-medium hover:bg-[var(--nx-bg-card)] transition flex items-center justify-center gap-1">
                  <Eye size={14} /> View
                </Link>
                <div className="w-px bg-[var(--nx-border-updated)]" />
                <button onClick={() => handleDeleteSingle(a.id, a.title || a.slug)} className="flex-1 py-2.5 text-center text-red-400 text-xs font-medium hover:bg-red-500/10 transition flex items-center justify-center gap-1">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Delete Modal - Single */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-6 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Delete Article?</h3>
            <p className="text-sm text-[var(--nx-text-muted-updated)] text-center mb-1">You are about to delete:</p>
            <p className="text-sm font-semibold text-white text-center mb-5 line-clamp-2">"{deleteTarget.title}"</p>
            <p className="text-xs text-red-400 text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg font-medium hover:border-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSingle}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Modal - Bulk */}
      {showBulkDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-6 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Delete {selectedIds.length} Articles?</h3>
            <p className="text-sm text-[var(--nx-text-muted-updated)] text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkDelete(false)}
                className="flex-1 py-3 bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg font-medium hover:border-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : `Delete ${selectedIds.length}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
