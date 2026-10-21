"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AlertCircle, CheckCircle, Eye, Clock } from "lucide-react";

type Report = {
  id: string;
  articleId: string;
  userId: string | null;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setReports(data.data);
        else setError(data.error);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <AdminLayout title="Content Reports">
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertCircle className="text-red-400" size={28} /> Content Reports
        </h1>
        <p className="text-sm text-[var(--nx-text-muted-updated)] mt-1">Review reports submitted by users.</p>
      </div>

      {loading ? (
        <p className="text-center text-white py-10">Loading...</p>
      ) : error ? (
        <div className="p-6 text-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>
      ) : reports.length === 0 ? (
        <div className="p-10 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl">
          <CheckCircle size={40} className="mx-auto text-green-400 opacity-50 mb-3" />
          <p className="text-[var(--nx-text-muted-updated)]">No reports yet. Everything looks good!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div key={r.id} className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
                    {r.reason.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    r.status === "pending" ? "text-yellow-400 border-yellow-400/30" : "text-green-400 border-green-400/30"
                  }`}>
                    <Clock size={10} /> {r.status}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--nx-text-muted-updated)]">{formatDate(r.createdAt)}</span>
              </div>
              
              {r.description && (
                <p className="text-sm text-[var(--nx-text-primary)] mb-3 bg-[var(--nx-bg-base-deep)] p-3 rounded-lg border border-[var(--nx-border-updated)]">
                  "{r.description}"
                </p>
              )}
              
              <div className="flex justify-end">
                <Link 
                  href={`/admin/content/library?id=${r.articleId}`} 
                  className="px-4 py-2 bg-[var(--nx-cyan)] text-black text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Eye size={14} /> View Article
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
