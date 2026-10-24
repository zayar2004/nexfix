"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { searchLocalData, getLocalData, LocalSearchResult } from "@/lib/local-db";
import { Search, Loader2, ChevronRight } from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const { t, locale } = useSettings();
  const isMyanmar = locale === "my";
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);

  // Local Data ရှိမရှိ စစ်မယ်
  useEffect(() => {
    getLocalData().then((data) => {
      setHasLocalData(!!data);
    });
  }, []);

  // Query ပြောင်းတိုင်း ရှာမယ်
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Local Data ကနေ အရင်ရှာမယ်
        const localResults = await searchLocalData(query);
        
        if (localResults.length > 0) {
          setResults(localResults);
          setLoading(false);
          return;
        }
        
        // Local မှာ မတွေ့ရင် Server ကနေ ရှာမယ် (Online ဖြစ်ရင်)
        if (navigator.onLine && hasLocalData === false) {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (data.ok && data.data) {
            setResults(data.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, hasLocalData]);

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-4">
        <h1 className="text-2xl font-bold text-white mb-4">{isMyanmar ? "ရှာဖွေရန်" : "Search"}</h1>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nx-text-muted-updated)]" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isMyanmar ? "Machine သို့ Error Code ရှာပါ..." : "Search machine or error code..."}
            className="w-full bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[var(--nx-cyan)] outline-none"
            autoFocus
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[var(--nx-cyan)] animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => router.push(`/errors/${r.id}`)}
                className="w-full text-left bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 hover:border-[var(--nx-cyan)]/50 transition flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--nx-cyan)]/20 text-[var(--nx-cyan)] font-mono">{r.code}</span>
                    <span className="text-xs text-[var(--nx-text-muted-updated)]">{r.machineName}</span>
                  </div>
                  <p className="text-sm text-white truncate">{r.title}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--nx-text-muted-updated)] flex-shrink-0" />
              </button>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="text-center py-20">
            <p className="text-sm text-[var(--nx-text-muted-updated)]">{isMyanmar ? "ရှာဖွေမှု မတွေ့ပါ" : "No results found"}</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-[var(--nx-text-muted-updated)] mx-auto mb-3" />
            <p className="text-sm text-[var(--nx-text-muted-updated)]">{isMyanmar ? "ရှာဖွေရန် စာသား ထည့်ပါ" : "Type to search"}</p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
