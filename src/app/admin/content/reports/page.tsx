"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AlertCircle, CheckCircle, Eye, Clock, XCircle, Filter } from "lucide-react";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");

  const fetchReports = () => {
    setLoading(true);
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => { if (data.ok) setReports(data.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleResolve = async (id: string, status: "resolved" | "rejected") => {
    try {
      // Report Status ကို Update လုပ်မယ် (API မရှိသေးရင် Skip)
      setMessage(`✅ Report marked as ${status}`);
      // Note: API မရှိသေးလို့ Report Status Update ကို နောက်မှ ထည့်ပါမယ်
      setReports(reports.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      setMessage("❌ Failed");
    }
  };

  const filteredReports = reports.filter(r => statusFilter === "all" || r.status === statusFilter);

  return (
    <AdminLayout title="Content Reports">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="text-red-400" size={28} /> Content Reports
            </h1>
            <p className="text-xs text-[var(--nx-text-muted-updated)] mt-1">User တင်ထားတဲ့ Report တွေကို စီမံခန့်ခွဲပါ</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-4 flex gap-2 overflow-x-auto">
          {["all", "pending", "resolved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
                statusFilter === status
                  ? "bg-[var(--nx-cyan)] text-black"
                  : "bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)]"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== "all" && ` (${reports.filter(r => r.status === status).length})`}
            </button>
          ))}
        </div>

        {message && <p className="text-center text-sm p-3 rounded-lg mb-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)]">{message}</p>}

        {loading ? (
          <p className="text-center text-white py-10">Loading...</p>
        ) : filteredReports.length === 0 ? (
          <div className="p-10 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl">
            <CheckCircle size={40} className="mx-auto text-green-400 opacity-50 mb-3" />
            <p className="text-[var(--nx-text-muted-updated)]">No reports found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredReports.map((r) => (
              <div key={r.id} className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
                      {r.reason.replace(/_/g, " ").toUpperCase()}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      r.status === "pending" ? "text-yellow-400 border-yellow-400/30" :
                      r.status === "resolved" ? "text-green-400 border-green-400/30" :
                      "text-gray-400 border-gray-400/30"
                    }`}>
                      <Clock size={10} /> {r.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--nx-text-muted-updated)]">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                
                {r.description && (
                  <p className="text-sm text-white mb-3 bg-[var(--nx-bg-base-deep)] p-3 rounded-lg border border-[var(--nx-border-updated)]">
                    "{r.description}"
                  </p>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  <Link 
                    href={`/admin/content/library?id=${r.articleId}`} 
                    className="px-4 py-2 bg-[var(--nx-cyan)] text-black text-xs font-bold rounded-lg flex items-center gap-1.5"
                  >
                    <Eye size={14} /> View Article
                  </Link>
                  {r.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleResolve(r.id, "resolved")}
                        className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-green-500/20 transition"
                      >
                        <CheckCircle size={14} /> Resolve
                      </button>
                      <button
                        onClick={() => handleResolve(r.id, "rejected")}
                        className="px-4 py-2 bg-gray-500/10 border border-gray-500/30 text-gray-400 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-gray-500/20 transition"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
