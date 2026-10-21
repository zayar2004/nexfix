"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Trash2, Tag, Save } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  sortOrder: string;
  isActive: boolean;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "book", sortOrder: "0" });
  const [message, setMessage] = useState("");

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => { if (data.ok) setCategories(data.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage("✅ Category created!");
      setForm({ name: "", slug: "", description: "", icon: "book", sortOrder: "0" });
      fetchCategories();
    } catch (err) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      setMessage("✅ Category deleted!");
      fetchCategories();
    } catch (err) {
      setMessage("❌ Failed");
    }
  };

  return (
    <AdminLayout title="Categories">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tag className="text-[var(--nx-cyan)]" size={28} /> Category Management
          </h1>
          <p className="text-sm text-[var(--nx-text-muted-updated)] mt-1">Library Category တွေ စီမံခန့်ခွဲပါ</p>
        </div>

        {/* Create Form */}
        <form onSubmit={handleSubmit} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-5 mb-6">
          <h2 className="text-sm font-bold text-white mb-3">+ New Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" required />
            <input type="text" placeholder="Slug (e.g. troubleshooting)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" required />
            <input type="text" placeholder="Description (Optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
            <input type="text" placeholder="Sort Order (e.g. 1)" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
          </div>
          <button type="submit" className="mt-3 px-6 py-2.5 bg-[var(--nx-cyan)] text-black text-sm font-bold rounded-lg flex items-center gap-1.5">
            <Plus size={16} /> Create Category
          </button>
          {message && <p className="mt-2 text-sm">{message}</p>}
        </form>

        {/* List */}
        {loading ? (
          <p className="text-center text-white py-10">Loading...</p>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">
            No categories yet. Create one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[var(--nx-cyan)]/10 flex items-center justify-center flex-shrink-0">
                    <Tag size={18} className="text-[var(--nx-cyan)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{c.name}</p>
                    <p className="text-xs text-[var(--nx-text-muted-updated)] truncate">/{c.slug}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
