"use client";

import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { HeroSection } from "@/components/home/HeroSection";
import { useState } from "react";
import { translate } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [locale] = useState<"my" | "en">("en");
  const [searchMode, setSearchMode] = useState<"machineError" | "machineCode">("machineError");
  
  const [machineName, setMachineName] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [machineCode, setMachineCode] = useState("");

  const t = (key: string) => translate(locale, key);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchMode === "machineError") {
      if (machineName) params.append("machine", machineName);
      if (errorCode) params.append("code", errorCode);
    } else {
      if (machineCode) params.append("code", machineCode);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      
      <main className="max-w-3xl mx-auto">
        <HeroSection locale={locale} />

        <div className="px-4 py-5 flex flex-col gap-5">
          
          {/* Segmented Control */}
          <div className="flex p-1 bg-[var(--nx-bg-card)] rounded-xl">
            <button 
              onClick={() => setSearchMode("machineError")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${searchMode === "machineError" ? "text-black bg-[var(--nx-accent)]" : "text-[var(--nx-text-muted-updated)]"}`}
            >
              {t("search.mode.machineError")}
            </button>
            <button 
              onClick={() => setSearchMode("machineCode")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${searchMode === "machineCode" ? "text-black bg-[var(--nx-accent)]" : "text-[var(--nx-text-muted-updated)]"}`}
            >
              {t("search.mode.machineCode")}
            </button>
          </div>

          {/* Search Inputs */}
          <div className="flex flex-col gap-3">
            {searchMode === "machineError" ? (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--nx-text-muted-updated)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12h12a4 4 0 0 1 0 8H6a4 4 0 0 1 0-8z"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></svg>
                  </div>
                  <input 
                    type="text" 
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    className="w-full h-[52px] pl-10 pr-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-white placeholder:text-[var(--nx-text-muted-updated)] focus:outline-none focus:border-[var(--nx-accent)]" 
                    placeholder={t("search.machine.placeholder")} 
                  />
                </div>
                <div className="relative flex">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--nx-text-muted-updated)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
                  </div>
                  <input 
                    type="text" 
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full h-[52px] pl-10 pr-14 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-white placeholder:text-[var(--nx-text-muted-updated)] focus:outline-none focus:border-[var(--nx-accent)]" 
                    placeholder={t("search.code.placeholder")} 
                  />
                  <button 
                    onClick={handleSearch}
                    className="absolute right-1 top-1 bottom-1 w-[44px] flex items-center justify-center bg-[var(--nx-accent)] rounded-lg text-black font-bold hover:brightness-110 transition-all"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="relative flex">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--nx-text-muted-updated)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
                </div>
                <input 
                  type="text" 
                  value={machineCode}
                  onChange={(e) => setMachineCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full h-[52px] pl-10 pr-14 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-white placeholder:text-[var(--nx-text-muted-updated)] focus:outline-none focus:border-[var(--nx-accent)]" 
                  placeholder={t("search.machineCode.placeholder")} 
                />
                <button 
                  onClick={handleSearch}
                  className="absolute right-1 top-1 bottom-1 w-[44px] flex items-center justify-center bg-[var(--nx-accent)] rounded-lg text-black font-bold hover:brightness-110 transition-all"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                </button>
              </div>
            )}
          </div>

          {/* Popular Machines */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mt-2">
            <span className="text-sm font-medium text-[var(--nx-text-muted-updated)] flex items-center gap-1 whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--nx-error)]"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              {t("popular.title")}
            </span>
            {["Tekken 7", "SF6", "Initial D", "WCCF"].map((m) => (
              <button 
                key={m} 
                onClick={() => {
                  setMachineName(m);
                  router.push(`/search?machine=${encodeURIComponent(m)}`);
                }}
                className="px-3 py-1.5 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-full text-sm text-white whitespace-nowrap hover:border-[var(--nx-accent)] transition-colors"
              >
                {m}
              </button>
            ))}
          </div>

          {/* Recent Diagnostics */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="nx-section-heading text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {t("recent.title")}
              </h2>
              <button className="text-sm text-[var(--nx-accent)] font-medium">{t("recent.viewAll")}</button>
            </div>

            <div className="text-center py-6 text-[var(--nx-text-muted-updated)] text-sm bg-[var(--nx-bg-card)] rounded-xl border border-dashed border-[var(--nx-border-updated)]">
              {t("recent.empty")}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
