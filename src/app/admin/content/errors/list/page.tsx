"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Toast, ToastType } from "@/components/ui/Toast";
import { Progress } from "@/components/ui/Progress";
import { Plus, Search, Filter, Trash2, CheckSquare, Square } from "lucide-react";

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
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal & Toast state
  const [deleteTarget, setDeleteTarget] = useState<string | string[] | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // Progress state
  const [deletingProgress, setDeletingProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredErrors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredErrors.map(e => e.id));
    }
  };

  const handleDeleteSingle = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget(selectedIds);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targets = Array.isArray(deleteTarget) ? deleteTarget : [deleteTarget];
    setDeleteTarget(null);
    setIsDeleting(true);
    setDeletingProgress(0);

    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < targets.length; i++) {
        const id = targets[i];
        try {
          await fetch(`/api/admin/errors?id=${id}`, { method: "DELETE" });
          successCount++;
        } catch (err) {
          failCount++;
        }
        // Update progress
        setDeletingProgress(Math.round(((i + 1) / targets.length) * 100));
      }

      if (failCount === 0) {
        setToast({ 
          message: targets.length > 1 ? `${successCount} errors deleted successfully` : "Error deleted successfully", 
          type: "success" 
        });
      } else {
        setToast({ 
          message: `${successCount} deleted, ${failCount} failed`, 
          type: "error" 
        });
      }
      
      setSelectedIds([]);
      fetchErrors();
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : "Failed to delete", 
        type: "error" 
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setDeletingProgress(0), 1000);
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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">All Error Codes</h1>
            <p className="text-sm text-[var(--nx-text-muted-updated)]">
              {selectedIds.length > 0 
                ? `${selectedIds.length} selected` 
                : `Manage and view all reported errors.`}
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {selectedIds.length > 0 ? (
              <button 
                onClick={handleDeleteBulk} 
                disabled={isDeleting}
                className="px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-lg hover:bg-red-500/30 transition flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <Trash2 size={18} /> {isDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
              </button>
            ) : (
              <Link href="/admin/content/errors" className="px-4 py-2.5 bg-[var(--nx-accent)] text-black font-bold rounded-lg hover:opacity-90 transition flex items-center gap-2 text-sm">
                <Plus size={18} /> Add New Error
              </Link>
            )}
          </div>
        </div>

        {/* Delete Progress Bar */}
        {isDeleting && deletingProgress > 0 && (
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-6">
            <p className="text-sm text-white mb-2 font-medium">Deleting errors...</p>
            <Progress value={deletingProgress} />
          </div>
        )}

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

        {/* Select All Bar */}
        {!loading && filteredErrors.length > 0 && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-[var(--nx-text-muted-updated)] hover:text-white transition">
              {selectedIds.length === filteredErrors.length ? <CheckSquare size={18} className="text-[var(--nx-accent)]"/> : <Square size={18} />}
              Select All ({filteredErrors.length})
            </button>
          </div>
        )}

        {/* Error List */}
        {loading ? (
          <p className="text-center text-white py-10">Loading errors...</p>
        ) : filteredErrors.length === 0 ? (
          <div className="text-center py-16 bg-[var(--nx-bg-card)] rounded-xl border border-[var(--nx-border-updated)]">
            <p className="text-lg text-[var(--nx-text-muted-updated)] mb-2">No errors found.</p>
            <p className="text-sm text-[var(--nx-text-muted-updated)]">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredErrors.map(e => {
              const isSelected = selectedIds.includes(e.id);
              return (
                <div 
                  key={e.id} 
                  className={`flex flex-col bg-[var(--nx-bg-card)] border rounded-xl p-4 transition cursor-pointer ${
                    isSelected ? "border-[var(--nx-accent)] bg-[var(--nx-accent)]/5" : "border-[var(--nx-border-updated)] hover:border-[var(--nx-accent)]/50"
                  }`}
                  onClick={() => toggleSelect(e.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {isSelected ? <CheckSquare size={18} className="text-[var(--nx-accent)]"/> : <Square size={18} className="text-[var(--nx-text-muted-updated)]" />}
                      <span className="px-2.5 py-1 bg-[var(--nx-accent)]/10 text-[var(--nx-accent)] text-xs font-mono font-bold rounded-md">{e.code}</span>
                    </div>
                    <span className="text-xs text-[var(--nx-text-muted-updated)] bg-[var(--nx-bg-base-deep)] px-2 py-1 rounded">{e.machineName}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-4 line-clamp-2 pl-7">{e.title}</h3>
                  <div className="mt-auto flex gap-2 pt-3 border-t border-[var(--nx-border-updated)]">
                    <Link 
                      href={`/admin/content/errors?id=${e.id}`} 
                      onClick={(e) => e.stopPropagation()} 
                      className="flex-1 text-center px-3 py-2 text-xs font-medium bg-[var(--nx-bg-surface-deep)] text-white rounded-lg hover:bg-[var(--nx-border-updated)] transition"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={(evt) => { evt.stopPropagation(); handleDeleteSingle(e.id); }} 
                      className="flex-1 px-3 py-2 text-xs font-medium bg-[var(--nx-error)]/10 text-[var(--nx-error)] border border-[var(--nx-error)]/30 rounded-lg hover:bg-[var(--nx-error)]/20 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={Array.isArray(deleteTarget) ? `Delete ${deleteTarget.length} Errors?` : "Delete Error Code?"}
        message={Array.isArray(deleteTarget) 
          ? `Are you sure you want to delete these ${deleteTarget.length} errors? This action cannot be undone.` 
          : "Are you sure you want to delete this error? This action cannot be undone and will also remove all related images and videos."}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
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
