"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowLeft, Copy, Check, Database, BookOpen } from "lucide-react";
import { searchPrivateExcelData, UserExcelRow } from "@/lib/local-db";
import { useSettings } from "@/lib/settings-context";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode") || "machineError";
  const { t } = useSettings();
  const initialQuery = searchParams.get("code") || searchParams.get("machine") || searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [excelResults, setExcelResults] = useState<UserExcelRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setSearched(true);
      try {
        if (mode === "machineCode") {
          const results = await searchPrivateExcelData(query);
          setExcelResults(results);
        } else {
          const machine = searchParams.get("machine") || "";
          const code = searchParams.get("code") || "";
          const q = searchParams.get("q") || query || "";
          const params = new URLSearchParams();
          if (machine) params.append("machine", machine);
          if (code) params.append("code", code);
          if (q) params.append("q", q);

          const res = await fetch(`/api/search?${params.toString()}`);
          const data = await res.json();
          if (data.ok) {
            setApiResults(data.results);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (query || mode === "machineCode") {
      fetchResults();
    }
  }, [query, mode, searchParams]);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] text-[var(--nx-text-primary)]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[var(--nx-bg-base-deep)]/90 backdrop-blur-md border-b border-[var(--nx-border-updated)] p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-[var(--nx-text-muted-updated)] mb-4 hover:text-[var(--nx-text-primary)] transition"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>

          <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
            {mode === "machineCode" ? (
              <>
                <Database size={20} className="text-[var(--nx-cyan)]" /> My Machine Codes
              </>
            ) : (
              "Search Results"
            )}
          </h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nx-text-muted-updated)]" size={18} />
            <input
              type="text"
              placeholder={
                mode === "machineCode"
                  ? t("searchExcelPlaceholder")
                  : t("searchArticlesErrors")
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl py-3 pl-10 pr-4 text-sm focus:border-[var(--nx-accent)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-10 text-[var(--nx-text-muted-updated)]">Searching...</div>
        ) : (
          <>
            {/* API Results (Error + Article) */}
            {mode !== "machineCode" && (
              <div className="flex flex-col gap-3">
                {apiResults.length === 0 && searched && (
                  <p className="text-center text-[var(--nx-text-muted-updated)] py-10">
                    {t("noResultsFound")}
                  </p>
                )}

                {apiResults.map((r) => {
                  // ===== ARTICLE CARD =====
                  if (r.type === "article") {
                    return (
                      <div
                        key={r.id}
                        onClick={() => router.push(`/library/${r.slug}`)}
                        className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-3 flex gap-3 cursor-pointer hover:border-[var(--nx-cyan)] transition"
                      >
                        <div className="w-20 h-20 flex-shrink-0 bg-[var(--nx-bg-base-deep)] rounded-lg overflow-hidden flex items-center justify-center border border-[var(--nx-border-updated)]">
                          {r.coverImageUrl ? (
                            <img
                              src={r.coverImageUrl}
                              alt={r.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="text-[var(--nx-text-muted-updated)]" size={24} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/15 text-cyan-400">
                              ART
                            </span>
                            {r.category && (
                              <span className="text-[10px] text-[var(--nx-text-muted-updated)]">
                                {r.category}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-[var(--nx-text-primary)] truncate">
                            {r.title}
                          </p>
                          {r.summary && (
                            <p className="text-xs text-[var(--nx-text-muted-updated)] line-clamp-1">
                              {r.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // ===== ERROR CARD =====
                  return (
                    <div
                      key={r.id}
                      onClick={() => router.push(`/errors/${r.id}`)}
                      className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-3 flex gap-3 cursor-pointer hover:border-[var(--nx-cyan)] transition"
                    >
                      <div className="w-20 h-20 flex-shrink-0 bg-[var(--nx-bg-base-deep)] rounded-lg overflow-hidden flex items-center justify-center border border-[var(--nx-border-updated)]">
                        {r.media && r.media.length > 0 ? (
                          <img
                            src={r.media[0].url}
                            alt={r.machineName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Database className="text-[var(--nx-text-muted-updated)]" size={24} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/15 text-red-400">
                            ERR
                          </span>
                          <p className="text-[10px] text-[var(--nx-text-muted-updated)]">
                            {r.machineName}
                          </p>
                        </div>
                        <h3 className="font-bold text-[var(--nx-cyan)] font-mono text-lg">{r.code}</h3>
                        <p className="text-sm text-[var(--nx-text-primary)] truncate">{r.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Excel Results (Private Machine Codes) */}
            {mode === "machineCode" && (
              <div className="flex flex-col gap-3">
                {excelResults.length === 0 && searched && (
                  <p className="text-center text-[var(--nx-text-muted-updated)] py-10">
                    {t("noExcelMatches")}
                  </p>
                )}
                {excelResults.map((row, idx) => {
                  const machineId = `machine-${idx}`;
                  const codeId = `code-${idx}`;
                  const fixId = `fix-${idx}`;

                  return (
                    <div
                      key={idx}
                      className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 hover:border-[var(--nx-cyan)] transition"
                    >
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-[var(--nx-border-updated)]">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[var(--nx-accent)]/20 text-[var(--nx-accent)] text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-[var(--nx-text-muted-updated)]">Result</span>
                        </div>
                        <button
                          onClick={() =>
                            handleCopy(
                              `${row.machineName} | ${row.errorCode} | ${row.errorFix}`,
                              `all-${idx}`
                            )
                          }
                          className="text-xs flex items-center gap-1 px-2 py-1 bg-[var(--nx-bg-base-deep)] rounded hover:bg-[var(--nx-bg-card)] transition text-[var(--nx-text-primary)]"
                        >
                          {copiedField === `all-${idx}` ? (
                            <>
                              <Check size={12} className="text-green-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copy All
                            </>
                          )}
                        </button>
                      </div>

                      <div className="mb-3">
                        <p className="text-[10px] text-[var(--nx-text-muted-updated)] uppercase mb-1">
                          Machine Name
                        </p>
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-semibold text-[var(--nx-text-primary)] break-all">
                            {row.machineName}
                          </p>
                          <button
                            onClick={() => handleCopy(row.machineName, machineId)}
                            className="text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-text-primary)] p-1"
                          >
                            {copiedField === machineId ? (
                              <Check size={14} className="text-green-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-[10px] text-[var(--nx-text-muted-updated)] uppercase mb-1">
                          Error Code
                        </p>
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-mono font-bold text-[var(--nx-cyan)] break-all">
                            {row.errorCode}
                          </p>
                          <button
                            onClick={() => handleCopy(row.errorCode, codeId)}
                            className="text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-text-primary)] p-1"
                          >
                            {copiedField === codeId ? (
                              <Check size={14} className="text-green-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-[var(--nx-text-muted-updated)] uppercase mb-1">
                          Error Fix
                        </p>
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm text-[var(--nx-text-secondary-updated)] break-all">
                            {row.errorFix}
                          </p>
                          <button
                            onClick={() => handleCopy(row.errorFix, fixId)}
                            className="text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-text-primary)] p-1"
                          >
                            {copiedField === fixId ? (
                              <Check size={14} className="text-green-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex items-center justify-center text-[var(--nx-text-primary)]">
          Loading...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
