"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { translate } from "@/lib/i18n";
import { getLocalData } from "@/lib/local-db";

type ErrorData = {
  id: string;
  code: string;
  title: string;
  machineName: string;
  machineCode: string;
};

type ContentData = {
  locale: string;
  cause: string | null;
  troubleshooting: string | null;
  solution: string | null;
  safety: string | null;
  notes: string | null;
};

export default function ErrorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [activeTab, setActiveTab] = useState<"overview" | "cause" | "solution" | "media">("overview");
  const [locale, setLocale] = useState<"my" | "en">("en");
  
  const [data, setData] = useState<ErrorData | null>(null);
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = (key: string) => translate(locale, key);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const localData = await getLocalData();
        if (!localData) throw new Error("No local data. Please sync first.");

        const errorRecord = localData.errorCodes.find((e) => String(e.id) === id);
        if (!errorRecord) throw new Error("Error not found locally.");

        const machineRecord = localData.machines.find((m) => String(m.id) === String(errorRecord.machineId));
        
        setData({
          id: String(errorRecord.id),
          code: String(errorRecord.code),
          title: String(errorRecord.title),
          machineName: String(machineRecord?.name || "Unknown"),
          machineCode: String(machineRecord?.code || "Unknown"),
        });

        const contents = localData.errorContents.filter((c) => String(c.errorCodeId) === id);
        const myContent = contents.find((c) => c.locale === "my");
        const enContent = contents.find((c) => c.locale === "en");
        const selected = locale === "my" ? (myContent || enContent || null) : (enContent || myContent || null);

        setContent(selected ? {
          locale: String(selected.locale),
          cause: selected.cause ? String(selected.cause) : null,
          troubleshooting: selected.troubleshooting ? String(selected.troubleshooting) : null,
          solution: selected.solution ? String(selected.solution) : null,
          safety: selected.safety ? String(selected.safety) : null,
          notes: selected.notes ? String(selected.notes) : null,
        } : null);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, locale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--nx-accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex flex-col items-center justify-center p-4">
        <p className="text-[var(--nx-error)] mb-4">{error || "Error not found"}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-[var(--nx-bg-card)] text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <header className="sticky top-0 z-50 bg-[var(--nx-bg-base-deep)]/90 backdrop-blur-md border-b border-[var(--nx-border-updated)]">
        <div className="flex items-center justify-between px-4 h-[var(--nx-top-nav-height)]">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-white hover:text-[var(--nx-accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <h1 className="text-lg font-bold text-white">Error Detail</h1>
          </div>
          <button 
            onClick={() => setLocale(locale === "my" ? "en" : "my")}
            className="flex items-center gap-1 px-2 py-1 bg-[var(--nx-bg-card)] rounded-md text-xs font-semibold text-white border border-[var(--nx-border-updated)]"
          >
            {locale === "my" ? "EN" : "MY"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        <div className="relative w-full h-[200px] sm:h-[250px] bg-[var(--nx-bg-surface-deep)]">
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--nx-bg-base-deep)] to-transparent z-10"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[var(--nx-text-muted-updated)]">
            [Machine Image]
          </div>
          
          <div className="absolute bottom-4 left-4 z-20">
            <p className="text-sm font-semibold text-[var(--nx-text-secondary-updated)]">{data.machineName}</p>
            <h2 className="text-3xl font-bold text-[var(--nx-accent)] font-mono">{data.code}</h2>
            <p className="text-lg font-semibold text-white">{data.title}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 bg-[var(--nx-warning)] text-black text-xs font-bold rounded-sm">Common</span>
              <span className="px-2 py-0.5 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] text-white text-xs font-medium rounded-sm">Hardware</span>
            </div>
          </div>
        </div>

        <div className="flex border-b border-[var(--nx-border-updated)] px-4 overflow-x-auto scrollbar-hide">
          {(["overview", "cause", "solution", "media"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab ? "text-[var(--nx-accent)]" : "text-[var(--nx-text-muted-updated)] hover:text-white"
              }`}
            >
              {t(`error.tab.${tab}`)}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--nx-accent)]"></div>}
            </button>
          ))}
        </div>

        <div className="p-4 pb-48">
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  Description
                </h3>
                <p className="text-[var(--nx-text-secondary-updated)] text-sm leading-relaxed">
                  {content?.cause || "No description available."}
                </p>
              </div>
              <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                  Quick Info
                </h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-[var(--nx-text-muted-updated)]">Category</span>
                  <span className="text-white text-right">Display</span>
                  <span className="text-[var(--nx-text-muted-updated)]">Probability</span>
                  <span className="text-white text-right">High</span>
                  <span className="text-[var(--nx-text-muted-updated)]">Affected Models</span>
                  <span className="text-white text-right">All Models</span>
                  <span className="text-[var(--nx-text-muted-updated)]">Last Updated</span>
                  <span className="text-white text-right">2024-06-12</span>
                </div>
              </div>
            </div>
          )}
          {activeTab === "cause" && (
            <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
              <h3 className="font-semibold text-white mb-2">Known Causes</h3>
              <p className="text-[var(--nx-text-secondary-updated)] text-sm whitespace-pre-wrap">{content?.troubleshooting || "No causes recorded yet."}</p>
            </div>
          )}
          {activeTab === "solution" && (
            <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
              <h3 className="font-semibold text-[var(--nx-success)] mb-2">Step-by-Step Solution</h3>
              <p className="text-[var(--nx-text-secondary-updated)] text-sm whitespace-pre-wrap">{content?.solution || "No solution recorded yet."}</p>
            </div>
          )}
          {activeTab === "media" && (
            <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">
              No media available for this error.
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-[calc(var(--nx-bottom-nav-height)+var(--nx-bottom-nav-safe-area)+16px)] left-4 right-4 z-40 max-w-3xl mx-auto">
        <button className="w-full py-3 bg-[var(--nx-accent)] text-black font-bold rounded-xl shadow-lg shadow-[var(--nx-accent)]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Mark as Resolved
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
