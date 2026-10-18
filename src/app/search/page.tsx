"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import Link from "next/link";
import { searchLocalData, LocalSearchResult } from "@/lib/local-db";

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const machine = searchParams.get("machine") || "";
  const code = searchParams.get("code") || "";
  
  const [results, setResults] = useState<LocalSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError("");
      try {
        // Search from Local Database instead of API
        const localResults = await searchLocalData(machine, code);
        setResults(localResults);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [machine, code]);

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-[var(--nx-text-primary)] hover:text-[var(--nx-accent)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl font-bold text-white">Search Results</h1>
        </div>

        {/* Search Bar (Editable) */}
        <div className="flex items-center gap-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-2 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-text-muted-updated)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          <input 
            type="text" 
            defaultValue={`${machine} ${code}`.trim()} 
            className="flex-1 bg-transparent text-white focus:outline-none px-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = e.currentTarget.value.split(' ');
                router.push(`/search?machine=${val[0] || ''}&code=${val[1] || ''}`);
              }
            }}
          />
        </div>

        {/* Result Count */}
        <div className="text-sm text-[var(--nx-text-muted-updated)] mb-4">
          {loading ? "Searching locally..." : `${results.length} results found (from local database)`}
        </div>

        {/* Results List */}
        {loading ? (
          <div className="flex flex-col gap-3">
             {[1,2,3].map(i => (
               <div key={i} className="h-24 bg-[var(--nx-bg-card)] animate-pulse rounded-xl border border-[var(--nx-border-updated)]"></div>
             ))}
          </div>
        ) : error ? (
          <div className="text-center py-10 text-[var(--nx-error)]">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-10 text-[var(--nx-text-muted-updated)]">
            No results found. Try a different search or sync data.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {results.map((r) => (
              <Link key={r.id} href={`/errors/${r.id}`}>
                <div className="flex gap-4 p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-accent)] transition-colors">
                  <div className="w-16 h-16 rounded-lg bg-[var(--nx-bg-surface-deep)] border border-[var(--nx-border-updated)] flex-shrink-0 flex items-center justify-center text-xs text-[var(--nx-text-muted-updated)] overflow-hidden">
                    IMG
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-white">{r.machineName}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nx-text-muted-updated)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                    <span className="text-sm font-mono text-[var(--nx-accent)]">{r.code}</span>
                    <span className="text-sm text-[var(--nx-text-secondary-updated)] truncate">{r.title}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex items-center justify-center text-white">Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
