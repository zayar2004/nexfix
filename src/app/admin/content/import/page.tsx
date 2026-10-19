"use client";

import { useState, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";

type PreviewRow = {
  machineName: string;
  errorCode: string;
  errorName: string;
  errorFix: string;
  imageUrl?: string;
  youtubeUrl?: string;
  status: "new" | "update" | "duplicate" | "invalid";
  error?: string;
};

type Summary = { total: number; inserted: number; skipped: number; failed: number };

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true); setMessage(""); setSummary(null); setPreview(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dryRun", "true");

      const res = await fetch("/api/admin/import-errors", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setPreview(data.preview);
    } catch (err) {
      setMessage("" + " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true); setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dryRun", "false");

      const res = await fetch("/api/admin/import-errors", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSummary(data.summary);
      setMessage("✅ Import complete!");
      setPreview(null);
    } catch (err) {
      setMessage("" + " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Bulk Import Errors">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Upload Excel or CSV</h2>
          <p className="text-sm text-[var(--nx-text-muted-updated)] mb-2">
            <strong>Required columns:</strong> Machine Name, Error Code, Error Name, Error Fix
          </p>
          <p className="text-sm text-[var(--nx-text-muted-updated)] mb-4">
            <strong>Optional columns:</strong> Image URL, YouTube URL
          </p>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setPreview(null); setSummary(null); }}
            className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--nx-accent)] file:text-black file:font-semibold file:cursor-pointer mb-4"
          />

          {file && !preview && (
            <button onClick={handlePreview} disabled={loading} className="w-full py-3 bg-[var(--nx-primary)] text-white font-bold rounded-lg">
              {loading ? "Reading..." : "Preview Import"}
            </button>
          )}

          {message && <p className="mt-4 text-center text-sm">{message}</p>}
        </div>

        {preview && (
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Preview ({preview.length} rows)</h2>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--nx-bg-surface-deep)]">
                  <tr className="text-left text-[var(--nx-text-muted-updated)]">
                    <th className="p-2">Status</th>
                    <th className="p-2">Machine</th>
                    <th className="p-2">Code</th>
                    <th className="p-2">Error Name</th>
                    <th className="p-2">Media</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-[var(--nx-border-updated)]">
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          row.status === "new" ? "bg-[var(--nx-success)]/20 text-[var(--nx-success)]" :
                          row.status === "duplicate" ? "bg-[var(--nx-warning)]/20 text-[var(--nx-warning)]" :
                          "bg-[var(--nx-error)]/20 text-[var(--nx-error)]"
                        }`}>{row.status}</span>
                      </td>
                      <td className="p-2 text-white">{row.machineName}</td>
                      <td className="p-2 text-[var(--nx-accent)] font-mono">{row.errorCode}</td>
                      <td className="p-2 text-[var(--nx-text-secondary-updated)] max-w-xs truncate">{row.errorName}</td>
                      <td className="p-2 text-xs text-[var(--nx-text-muted-updated)]">
                        {row.imageUrl && <div className="text-blue-400">🖼 Image</div>}
                        {row.youtubeUrl && <div className="text-red-400">📺 Video</div>}
                        {!row.imageUrl && !row.youtubeUrl && "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleImport} disabled={loading} className="flex-1 py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg">
                {loading ? "Importing..." : `Confirm Import (${preview.filter(r => r.status === "new").length} new)`}
              </button>
              <button onClick={() => setPreview(null)} className="px-4 py-3 bg-[var(--nx-bg-surface-deep)] text-white rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        {summary && (
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-success)]/30 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Import Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-[var(--nx-bg-surface-deep)] p-3 rounded-lg"><p className="text-xs text-[var(--nx-text-muted-updated)]">Total</p><p className="text-2xl font-bold text-white">{summary.total}</p></div>
              <div className="bg-[var(--nx-bg-surface-deep)] p-3 rounded-lg"><p className="text-xs text-[var(--nx-text-muted-updated)]">Inserted</p><p className="text-2xl font-bold text-[var(--nx-success)]">{summary.inserted}</p></div>
              <div className="bg-[var(--nx-bg-surface-deep)] p-3 rounded-lg"><p className="text-xs text-[var(--nx-text-muted-updated)]">Skipped</p><p className="text-2xl font-bold text-[var(--nx-warning)]">{summary.skipped}</p></div>
              <div className="bg-[var(--nx-bg-surface-deep)] p-3 rounded-lg"><p className="text-xs text-[var(--nx-text-muted-updated)]">Failed</p><p className="text-2xl font-bold text-[var(--nx-error)]">{summary.failed}</p></div>
            </div>
            <div className="flex justify-center">
              <Link href="/admin/content/errors/list" className="px-6 py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg hover:opacity-90 transition inline-flex items-center gap-2">
                View All Imported Errors
              </Link>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
