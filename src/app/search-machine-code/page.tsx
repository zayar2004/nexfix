"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import * as XLSX from "xlsx";
import { getPrivateExcelData, savePrivateExcelData, UserExcelRow } from "@/lib/local-db";

export default function SearchMachineCodePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<UserExcelRow[]>([]);
  const [hasExcel, setHasExcel] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // App စဝင်တာနဲ့ Excel ရှိ/မရှိ စစ်မယ်
  useEffect(() => {
    getPrivateExcelData().then(data => setHasExcel(!!data));
  }, []);

  // ရှာတဲ့စာသား ပြောင်းတိုင်း ရှာမယ်
  useEffect(() => {
    async function fetchResults() {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      const userData = await getPrivateExcelData();
      if (userData) {
        const lowerQ = query.toLowerCase();
        const matched = userData.filter(row => 
          row.machineName.toLowerCase().includes(lowerQ) || 
          row.errorCode.toLowerCase().includes(lowerQ)
        );
        setResults(matched);
      }
    }
    fetchResults();
  }, [query]);

  const handleSearch = () => {
    if (!inputValue.trim()) return;
    setQuery(inputValue.trim());
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("📋 Copied: " + text);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
      
      const parsedRows: UserExcelRow[] = [];
      for (const row of jsonData) {
        const mCode = row["Machine Code"] || row["Machine"] || row["machineName"];
        const aDate = row["Arrival Date"] || "";
        const loc = row["Location"] || "";

        if (mCode) {
          parsedRows.push({
            machineName: String(mCode).trim(),
            errorCode: String(aDate).trim(),
            errorFix: String(loc).trim(),
          });
        }
      }

      if (parsedRows.length === 0) throw new Error("No valid data found. Ensure 'Machine Code' column exists.");
      
      // အသစ်သိမ်းတာနဲ့ အဟောင်းကို Auto အစားထိုးသွားမယ်
      await savePrivateExcelData(parsedRows);
      setHasExcel(true);
      alert(`✅ Loaded and replaced with ${parsedRows.length} rows from ${file.name}`);
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-[var(--nx-text-primary)] hover:text-[var(--nx-accent)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl font-bold text-white">Search by Machine Code</h1>
        </div>

        {/* Excel Upload Box (အမြဲပေါ်နေမယ်) */}
        <div className="mb-6 p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-accent)]/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-white font-bold text-sm">Your Private Excel Data</h3>
            <p className="text-xs text-[var(--nx-text-muted-updated)] mt-0.5">
              {hasExcel 
                ? `Active file loaded. Upload a new one to replace it.` 
                : "Upload an Excel file (Machine Code, Arrival Date, Location)."}
            </p>
          </div>
          <div>
            <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading} 
              className="px-4 py-2 bg-[var(--nx-bg-surface-deep)] hover:bg-[var(--nx-bg-elevated-deep)] border border-[var(--nx-border-updated)] text-white font-semibold rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              {uploading ? "Replacing..." : hasExcel ? "📁 Replace Excel File" : "📁 Upload Excel File"}
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative flex shadow-lg shadow-black/20 rounded-2xl mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--nx-text-muted-updated)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          </div>
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
            className="w-full h-[56px] pl-12 pr-16 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl text-white focus:outline-none focus:border-[var(--nx-accent)] text-lg" 
            placeholder="Search your Excel Machine Code..." 
          />
          <button 
            onClick={handleSearch} 
            className="absolute right-1.5 top-1.5 bottom-1.5 w-[48px] flex items-center justify-center bg-[var(--nx-accent)] rounded-xl text-black font-bold hover:brightness-110 active:scale-95 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Results */}
        {hasExcel === false ? (
           <p className="text-center py-10 text-[var(--nx-text-muted-updated)]">Please upload an Excel file first.</p>
        ) : results.length === 0 && query ? (
          <p className="text-center py-10 text-[var(--nx-text-muted-updated)]">No matching codes found in your Excel data.</p>
        ) : results.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[var(--nx-success)] uppercase mb-1">My Excel Codes ({results.length})</h3>
            {results.map((r, i) => (
              <div key={i} className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-success)]/30 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-white text-lg">{r.machineName}</span>
                    <div className="text-sm text-[var(--nx-text-secondary-updated)] mt-1 flex flex-col gap-1">
                      <span><strong className="text-white">Date:</strong> {r.errorCode || "N/A"}</span>
                      <span><strong className="text-white">Location:</strong> {r.errorFix || "N/A"}</span>
                    </div>
                  </div>
                  <button onClick={() => handleCopy(r.machineName)} className="text-xs text-[var(--nx-accent)] font-medium bg-[var(--nx-accent)]/10 px-2 py-1 rounded">Copy Code</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
