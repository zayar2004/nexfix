"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import Link from "next/link";
import { searchLocalData, LocalSearchResult } from "@/lib/local-db";
import { useSettings } from "@/lib/settings-context";

function SearchResultsContent() {
  const router = useRouter();
  const { t } = useSettings();
  const searchParams = useSearchParams();
  
  const machineParam = searchParams.get("machine") || "";
  const codeParam = searchParams.get("code") || "";
  const modeParam = searchParams.get("mode") || "machineError";

  const [searchMode, setSearchMode] = useState<"machineError" | "machineCode">(modeParam === "machineCode" ? "machineCode" : "machineError");
  
  const [machineName, setMachineName] = useState(machineParam);
  const [errorCode, setErrorCode] = useState(codeParam);
  const [machineCode, setMachineCode] = useState(codeParam);
  
  const [results, setResults] = useState<LocalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    setSearchMode(modeParam === "machineCode" ? "machineCode" : "machineError");
    setIsOffline(!navigator.onLine);
    
    const handleFocus = () => setIsKeyboardOpen(true);
    const handleBlur = () => setIsKeyboardOpen(false);
    
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    });

    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      });
    };
  }, [modeParam, searchMode]); 

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchMode === "machineError") {
        setLoading(true);
        const localResults = await searchLocalData(machineName, errorCode);
        setResults(localResults); 
        setLoading(false);
      } else {
        if (!machineCode.trim()) {
          setResults([]);
          return;
        }
        setLoading(true);
        const localResults = await searchLocalData(machineCode, "");
        setResults(localResults.filter(r => r.isFromExcel)); 
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [machineName, errorCode, machineCode, searchMode]);

  const handleTabSwitch = (mode: "machineError" | "machineCode") => {
    setSearchMode(mode);
    setMachineName("");
    setErrorCode("");
    setMachineCode("");
    setResults([]);
    router.push(`/search?mode=${mode}`);
  };

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000); 
    } catch (err) {
      console.error("Copy failed");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav relative">
      
      {showCopied && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] bg-[var(--nx-success)] text-black font-bold px-6 py-2 rounded-full shadow-xl">
          ✅ {t("copied")}
        </div>
      )}

      <TopNav />
      
      <div className="sticky top-[var(--nx-top-nav-height)] z-40 bg-[var(--nx-bg-base-deep)]/95 backdrop-blur-md pt-4 pb-4 border-b border-[var(--nx-border-updated)]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-[var(--nx-text-primary)] hover:text-[var(--nx-accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <h1 className="text-xl font-bold text-[var(--nx-text-primary)]">{t("searchResults")}</h1>
          </div>

          {isOffline && (
            <div className="mb-4 p-2 bg-[var(--nx-warning)]/10 border border-[var(--nx-warning)]/30 rounded-lg text-xs text-[var(--nx-warning)] text-center">
              Offline mode. Showing cached results.
            </div>
          )}

          <div className="flex p-1 bg-[var(--nx-bg-card)] rounded-xl mb-4">
            <button 
              onClick={() => handleTabSwitch("machineError")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${searchMode === "machineError" ? "text-black bg-[var(--nx-accent)]" : "text-[var(--nx-text-muted-updated)]"}`}
            >
              {t("machineErrorTab")}
            </button>
            <button 
              onClick={() => handleTabSwitch("machineCode")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${searchMode === "machineCode" ? "text-black bg-[var(--nx-accent)]" : "text-[var(--nx-text-muted-updated)]"}`}
            >
              {t("machineCodeTab")}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {searchMode === "machineError" ? (
              <>
                <input 
                  type="text" 
                  value={machineName} 
                  onChange={(e) => setMachineName(e.target.value)} 
                  className="w-full h-[48px] px-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-primary)] placeholder:text-[var(--nx-text-muted-updated)] focus:outline-none focus:border-[var(--nx-accent)]" 
                  placeholder={t("machineNamePlaceholder")} 
                />
                <input 
                  type="text" 
                  value={errorCode} 
                  onChange={(e) => setErrorCode(e.target.value)} 
                  className="w-full h-[48px] px-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-primary)] placeholder:text-[var(--nx-text-muted-updated)] focus:outline-none focus:border-[var(--nx-accent)]" 
                  placeholder={t("errorCodePlaceholder")} 
                />
              </>
            ) : (
              <input 
                type="text" 
                value={machineCode} 
                onChange={(e) => setMachineCode(e.target.value)} 
                className="w-full h-[48px] px-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-primary)] placeholder:text-[var(--nx-text-muted-updated)] focus:outline-none focus:border-[var(--nx-accent)]" 
                placeholder={t("machineCodePlaceholder")} 
              />
            )}
          </div>
        </div>
      </div>

      <main className={`max-w-3xl mx-auto px-4 py-4 ${isKeyboardOpen ? 'pb-[40vh]' : 'pb-20'}`}>
        
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[var(--nx-accent)] border-t-transparent rounded-full animate-spin"></div></div>
        ) : searchMode === "machineError" ? (
          results.length === 0 ? (
            <p className="text-center py-10 text-[var(--nx-text-muted-updated)]">
              {(machineName || errorCode) ? t("noResults") : t("typeToSearch")}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((r) => (
                <div key={r.id} className={`p-3 rounded-xl border ${r.isFromExcel ? 'bg-[var(--nx-bg-card)] border-[var(--nx-success)]/30' : 'bg-[var(--nx-bg-card)] border-[var(--nx-border-updated)]'}`}>
                  {r.isFromExcel ? (
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-[var(--nx-text-primary)] text-sm break-words block">{r.machineName}</span>
                        <div className="text-xs text-[var(--nx-text-secondary-updated)] mt-1.5 flex flex-col gap-0.5">
                          <span className="break-words"><strong className="text-[var(--nx-text-primary)]">{t("date")}:</strong> {r.code || "N/A"}</span>
                          <span className="break-words"><strong className="text-[var(--nx-text-primary)]">{t("location")}:</strong> {r.solution || "N/A"}</span>
                        </div>
                      </div>
                      <button onClick={(e) => handleCopy(e, r.machineName)} className="text-[10px] text-[var(--nx-accent)] font-medium bg-[var(--nx-accent)]/10 px-2 py-1 rounded flex-shrink-0">{t("copy")}</button>
                    </div>
                  ) : (
                    <Link href={`/errors/${r.id}`}>
                      <div className="flex gap-4">
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-[var(--nx-text-primary)] text-sm truncate">{r.machineName}</span>
                          <span className="text-xs font-mono text-[var(--nx-accent)] ml-2">{r.code}</span>
                          <span className="text-xs text-[var(--nx-text-secondary-updated)] truncate block mt-1">{r.title}</span>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          results.length === 0 ? (
            <p className="text-center py-10 text-[var(--nx-text-muted-updated)]">
              {machineCode ? t("noMatchingCodes") : t("typeToSearch")}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((r, i) => (
                <div key={i} className="p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-success)]/30 rounded-xl">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-[var(--nx-text-primary)] text-sm break-words block">{r.machineName}</span>
                      <div className="text-xs text-[var(--nx-text-secondary-updated)] mt-1.5 flex flex-col gap-0.5">
                        <span className="break-words"><strong className="text-[var(--nx-text-primary)]">{t("date")}:</strong> {r.code || "N/A"}</span>
                        <span className="break-words"><strong className="text-[var(--nx-text-primary)]">{t("location")}:</strong> {r.solution || "N/A"}</span>
                      </div>
                    </div>
                    <button onClick={(e) => handleCopy(e, r.machineName)} className="text-[10px] text-[var(--nx-accent)] font-medium bg-[var(--nx-accent)]/10 px-2 py-1 rounded flex-shrink-0">{t("copy")}</button>
                  </div>
                </div>
              ))}
            </div>
          )
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
