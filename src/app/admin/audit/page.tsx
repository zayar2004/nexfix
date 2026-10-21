"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { List, Clock } from "lucide-react";

type AuditLog = {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setLogs(data.data);
        else setError(data.error);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const getActionColor = (action: string) => {
    if (action === "create") return "text-green-400 bg-green-400/10 border-green-400/20";
    if (action === "update") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    if (action === "delete") return "text-red-400 bg-red-400/10 border-red-400/20";
    return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  };

  return (
    <AdminLayout title="Audit Log">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <List className="text-[var(--nx-cyan)]" size={28} /> Audit Log
          </h1>
          <p className="text-sm text-[var(--nx-text-muted-updated)] mt-1">Recent admin actions.</p>
        </div>

        {loading ? (
          <p className="text-center text-white py-10">Loading...</p>
        ) : error ? (
          <div className="p-6 text-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl">
            <Clock size={40} className="mx-auto text-[var(--nx-text-muted-updated)] opacity-30 mb-3" />
            <p className="text-[var(--nx-text-muted-updated)]">No actions recorded yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getActionColor(log.action)}`}>
                  {log.action.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{log.details || log.entityType}</p>
                  <p className="text-[10px] text-[var(--nx-text-muted-updated)]">{log.entityType}</p>
                </div>
                <span className="text-[10px] text-[var(--nx-text-muted-updated)] flex-shrink-0">{formatDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
