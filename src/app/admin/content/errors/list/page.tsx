"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Toast, ToastType } from "@/components/ui/Toast";
import { Plus, Search, Filter } from "lucide-react";

type ErrorCode = {
  id: string;
  code: string;
  title: string;
  machineName?: string;
};

export default function ErrorListPage() {
  const [errors, setErrors] = useState<ErrorCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMachine, setFilterMachine] = useState("all");
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/errors");
      const data = await res.json();
      if (data.ok) setErrors(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchErrors(); }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);

    try {
      const res = await fetch(`/api/admin/errors?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      
      setToast({ message: "Error deleted successfully", type: "success" });
      fetchErrors();
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : "Failed to delete error", 
        type: "error" 
      });
    }
  };

  const uniqueMachines = Array.from(new Set(errors.map(e => e.machineName).filter(Boolean))) as string[];

  const filteredErrors = errors.filter(e => {
    const matchesSearch = 
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMachine = filterMachine === "all" || e.machineName === filterMachine;
    return matchesSearch && matchesMachine;
  });

  return (
    <AdminLayout title="Error List">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">All Error Codes</h1>
            <p className="text-sm text-[var(--nx-text-muted-updated)]">Manage and view all reported errors.</p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Link href="/admin/content/errors" className="px-4 py-2.5 bg-[var(--nx-accent)] text-black font-bold rounded-lg hover:opacity-90 transition flex items-center gap-2 text-sm">
              <Plus size={18} /> Add New Error
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--nx-text-muted-updated)]">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search by error code or title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg py-3 pl-10 pr-3 text-sm focus:border-[var(--nx-accent)] outline-none"
            />
          </div>
          <div className="md:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--nx-text-muted-updated)]">
              <Filter size={18} />
            </div>
            <select 
              value={filterMachine}
              onChange={(e) => setFilterMachine(e.target.value)}
              className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg py-3 pl-10 pr-8 text-sm focus:border-[var(--nx-accent)] outline-none appearance-none"
            >
              <option value="all">All Machines</option>
              {uniqueMachines.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-white py-10">Loading errors...</p>
        ) : filteredErrors.length === 0 ? (
          <div className="text-center py-16 bg-[var(--nx-bg-card)] rounded-xl border border-[var(--nx-border-updated)]">
            <p className="text-lg text-[var(--nx-text-muted-updated)] mb-2">No errors found.</p>
            <p className="text-sm text-[var(--nx-text-muted-updated)]">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredErrors.map(e => (
              <div key={e.id} className="flex flex-col bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 hover:border-[var(--nx-accent)]/50 transition">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 bg-[var(--nx-accent)]/10 text-[var(--nx-accent)] text-xs font-mono font-bold rounded-md">{e.code}</span>
                  <span className="text-xs text-[var(--nx-text-muted-updated)] bg-[var(--nx-bg-base-deep)] px-2 py-1 rounded">{e.machineName}</span>
                </div>
                <h3 className="text-base font-semibold text-white mb-4 line-clamp-2">{e.title}</h3>
                <div className="mt-auto flex gap-2 pt-3 border-t border-[var(--nx-border-updated)]">
                  <Link href={`/admin/content/errors?id=${e.id}`} className="flex-1 text-center px-3 py-2 text-xs font-medium bg-[var(--nx-bg-surface-deep)] text-white rounded-lg hover:bg-[var(--nx-border-updated)] transition">Edit</Link>
                  <button onClick={() => setDeleteId(e.id)} className="flex-1 px-3 py-2 text-xs font-medium bg-[var(--nx-error)]/10 text-[var(--nx-error)] border border-[var(--nx-error)]/30 rounded-lg hover:bg-[var(--nx-error)]/20 transition">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Error Code?"
        message="Are you sure you want to delete this error? This action cannot be undone and will also remove all related images and videos."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </AdminLayout>
  );
}
