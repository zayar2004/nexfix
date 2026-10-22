"use client";

import { useState, useEffect, useRef } from "react";
import { getLocalData } from "@/lib/local-db";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { getPrivateExcelData, savePrivateExcelData, UserExcelRow, clearPrivateExcelData } from "@/lib/local-db";
import { useSettings } from "@/lib/settings-context";

export function HomeSearchClient({ locale }: { locale: "my" | "en" }) {
  const router = useRouter();
  const { t } = useSettings();
  const [popularMachines, setPopularMachines] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState<"machineError" | "machineCode">("machineError");
  
  const [machineName, setMachineName] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [machineCode, setMachineCode] = useState("");

  const [hasExcel, setHasExcel] = useState<boolean | null>(null);
  const [totalMachines, setTotalMachines] = useState(0);
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Machines ကို Local Storage ကနေ ယူမယ်
    getLocalData().then((data) => {
      if (data?.machines) {
        const names = (data.machines as Record<string, unknown>[])
          .map((m) => String(m.name))
          .filter(Boolean);
        setPopularMachines(names.slice(0, 6));
      }
    });
    getPrivateExcelData().then(data => {
      setHasExcel(!!data);
      if (data) setTotalMachines(data.length);
    });
  }, []);

  const handleSearch = () => {
    if (searchMode === "machineError") {
      const params = new URLSearchParams();
      params.append("mode", "machineError");
      if (machineName) params.append("machine", machineName);
      if (errorCode) params.append("code", errorCode);
      if (!machineName && !errorCode) return; 
      router.push(`/search?${params.toString()}`);
    } else {
      const params = new URLSearchParams();
      params.append("mode", "machineCode");
      if (machineCode) params.append("code", machineCode);
      router.push(`/search?${params.toString()}`);
    }
  };

  const formatExcelDate = (value: any) => {
    if (value === null || value === undefined || value === "") return "";
    if (value instanceof Date) {
      return value.toISOString().split("T")[0];
    }
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > 20000 && numValue < 60000) {
      const utcDays = numValue - 25569;
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      const mmTime = new Date(dateInfo.getTime() + (6.5 * 60 * 60 * 1000));
      const year = mmTime.getUTCFullYear();
      const month = String(mmTime.getUTCMonth() + 1).padStart(2, '0');
      const day = String(mmTime.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    const str = String(value).trim();
    if (str.includes("T")) return str.split("T")[0];
    return str;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { cellDates: true });
      
      const parsedRows: UserExcelRow[] = [];
      const TARGET_COLUMN = "Machine Code";
      const DATE_COLUMN = "Arrival Date";
      const LOCATION_COLUMN = "Location";

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        if (jsonData.length === 0) continue;

        const firstRowKeys = Object.keys(jsonData[0]);
        const machineCodeKey = firstRowKeys.find(k => k.trim() === TARGET_COLUMN);
        if (!machineCodeKey) continue; 

        const dateKey = firstRowKeys.find(k => k.trim() === DATE_COLUMN) || firstRowKeys.find(k => k.toLowerCase().includes("date"));
        const locKey = firstRowKeys.find(k => k.trim() === LOCATION_COLUMN) || firstRowKeys.find(k => k.toLowerCase().includes("location") || k.toLowerCase() === "loc");

        for (const row of jsonData) {
          const mCode = row[machineCodeKey];
          if (mCode && String(mCode).trim() !== "") {
            parsedRows.push({
              machineName: String(mCode).trim(),
              errorCode: dateKey && row[dateKey] ? formatExcelDate(row[dateKey]) : "",
              errorFix: locKey && row[locKey] ? String(row[locKey]).trim() : "",
            });
          }
        }
      }

      const uniqueRows = Array.from(new Map(parsedRows.map(item => [item.machineName, item])).values());
      if (uniqueRows.length === 0) throw new Error(`No "${TARGET_COLUMN}" column found in any sheet.`);
      
      await savePrivateExcelData(uniqueRows);
      
      setHasExcel(true);
      setTotalMachines(uniqueRows.length);
      setFileName(file.name);
      
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = async () => {
    if (!confirm(t("clearExcelConfirm"))) return;
    await clearPrivateExcelData();
    setHasExcel(false);
    setTotalMachines(0);
    setFileName("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex p-1 bg-[var(--nx-bg-card)] rounded-xl">
        <button
          onClick={() => setSearchMode("machineError")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${searchMode === "machineError" ? "text-black bg-[var(--nx-accent)]" : "text-[var(--nx-text-muted-updated)]"}`}
        >
          {t("machineErrorTab")}
        </button>
        <button
          onClick={() => setSearchMode("machineCode")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${searchMode === "machineCode" ? "text-black bg-[var(--nx-accent)]" : "text-[var(--nx-text-muted-updated)]"}`}
        >
          {t("machineCodeTab")}
        </button>
      </div>

      {searchMode === "machineCode" && (
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${hasExcel ? 'bg-gradient-to-br from-[var(--nx-bg-card)] to-[var(--nx-success)]/5 border-[var(--nx-success)]/30' : 'bg-[var(--nx-bg-card)] border-dashed border-[var(--nx-accent)]/50 hover:border-[var(--nx-accent)]'}`}>
          
          <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          
          {!hasExcel ? (
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading} 
              className="w-full p-6 flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--nx-accent)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div className="text-center">
                <p className="text-[var(--nx-text-primary)] font-bold">{uploading ? t("loading") : t("uploadExcel")}</p>
              </div>
            </button>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--nx-success)]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--nx-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--nx-text-primary)] truncate max-w-[200px]">{fileName || "Excel Data"}</p>
                    <p className="text-xs text-[var(--nx-success)] font-medium mt-0.5">
                      {totalMachines} Machine Codes
                    </p>
                  </div>
                </div>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--nx-success)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--nx-success)]"></span>
                </span>
              </div>
              
              <div className="flex gap-2 mt-1">
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading}
                  className="flex-1 py-2 bg-[var(--nx-bg-surface-deep)] hover:bg-[var(--nx-bg-elevated-deep)] border border-[var(--nx-border-updated)] text-[var(--nx-text-primary)] text-xs font-semibold rounded-lg transition-colors"
                >
                  {t("replaceExcel")}
                </button>
                <button 
                  onClick={handleRemoveFile}
                  className="px-3 py-2 bg-[var(--nx-error)]/10 hover:bg-[var(--nx-error)]/20 border border-[var(--nx-error)]/30 text-[var(--nx-error)] text-xs font-semibold rounded-lg transition-colors"
                >
                  {t("removeExcel")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
                className="w-full h-[52px] pl-10 pr-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-primary)] placeholder:text-[var(--nx-text-muted-updated)] focus:outline-none focus:border-[var(--nx-accent)]" 
                placeholder={t("searchMachine")} 
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
                className="w-full h-[52px] pl-10 pr-14 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-primary)] placeholder:text-[var(--nx-text-muted-updated)] focus:outline-none focus:border-[var(--nx-accent)]" 
                placeholder={t("searchError")} 
              />
              <button onClick={handleSearch} className="absolute right-1 top-1 bottom-1 w-[44px] flex items-center justify-center bg-[var(--nx-accent)] rounded-lg text-black font-bold hover:brightness-110 transition-all">
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
              className="w-full h-[52px] pl-10 pr-14 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-primary)] placeholder:text-[var(--nx-text-muted-updated)] focus:outline-none focus:border-[var(--nx-accent)]" 
              placeholder={t("searchMachineCode")} 
            />
            <button onClick={handleSearch} className="absolute right-1 top-1 bottom-1 w-[44px] flex items-center justify-center bg-[var(--nx-accent)] rounded-lg text-black font-bold hover:brightness-110 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
            </button>
          </div>
        )}
      </div>

      {popularMachines.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mt-1">
          <span className="text-sm font-medium text-[var(--nx-text-muted-updated)] flex items-center gap-1 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--nx-error)]"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            {t("popular")}
          </span>
          {popularMachines.map((m: string) => (
            <button key={m} onClick={() => { setMachineName(m); router.push(`/search?machine=${encodeURIComponent(m)}`); }} className="px-3 py-1.5 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-full text-sm text-[var(--nx-text-primary)] whitespace-nowrap hover:border-[var(--nx-accent)] transition-colors">
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
