"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowLeft, Copy, Check, Database, Cpu } from "lucide-react";
import { searchPrivateExcelData, UserExcelRow } from "@/lib/local-db";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const mode = searchParams.get("mode") || "machineError";
  const initialQuery = searchParams.get("code") || searchParams.get("machine") || "";
  
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
          // Search Private Excel Data
          const results = await searchPrivateExcelData(query);
          setExcelResults(results);
        } else {
          // Search API (Machine/Error)
          const machine = searchParams.get("machine") || "";
          const code = searchParams.get("code") || "";
          const params = new URLSearchParams();
          if (machine) params.append("machine", machine);
          if (code) params.append("code", code);
          
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
    <div className="min-h-screen bg-[#0B1020] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0B1020]/90 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm text-gray-400 mb-4 hover:text-white transition">
            <ArrowLeft size={16} /> Back to Home
          </button>
          
          <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
            {mode === "machineCode" ? <><Database size={20} className="text-[#20E3FF]" /> My Machine Codes</> : "Search Results"}
          </h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder={mode === "machineCode" ? "Search your Excel data..." : "Search error codes..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#151B2E] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-[#176BFF] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Searching...</div>
        ) : (
          <>
            {/* API Results (Machine/Error) */}
            {mode !== "machineCode" && (
              <div className="flex flex-col gap-3">
                {apiResults.length === 0 && searched && (
                  <p className="text-center text-gray-400 py-10">No errors found.</p>
                )}
                {apiResults.map((r) => (
                  <div 
                    key={r.id} 
                    onClick={() => router.push(`/errors/${r.id}`)}
                    className="bg-[#151B2E] border border-white/5 rounded-xl p-3 flex gap-4 cursor-pointer hover:border-[#176BFF]/50 transition"
                  >
                    <div className="w-20 h-20 flex-shrink-0 bg-[#0B1020] rounded-lg overflow-hidden flex items-center justify-center border border-white/5">
                      {r.media && r.media.length > 0 ? (
                        <img src={r.media[0].url} alt={r.machineName} className="w-full h-full object-cover" />
                      ) : (
                        <Database className="text-gray-600" size={24} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-xs text-gray-400 mb-0.5">{r.machineName}</p>
                      <h3 className="font-bold text-[#20E3FF] font-mono text-lg">{r.code}</h3>
                      <p className="text-sm text-gray-200 truncate">{r.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Excel Results (Private Machine Codes) */}
            {mode === "machineCode" && (
              <div className="flex flex-col gap-3">
                {excelResults.length === 0 && searched && (
                  <p className="text-center text-gray-400 py-10">No matching codes found in your Excel.</p>
                )}
                {excelResults.map((row, idx) => {
                  const machineId = `machine-${idx}`;
                  const codeId = `code-${idx}`;
                  const fixId = `fix-${idx}`;
                  
                  return (
                    <div key={idx} className="bg-[#151B2E] border border-white/5 rounded-xl p-4 hover:border-[#176BFF]/50 transition">
                      {/* Header */}
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#176BFF]/20 text-[#176BFF] text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                          <span className="text-xs text-gray-400">Result</span>
                        </div>
                        <button 
                          onClick={() => handleCopy(`${row.machineName} | ${row.errorCode} | ${row.errorFix}`, `all-${idx}`)}
                          className="text-xs flex items-center gap-1 px-2 py-1 bg-[#0B1020] rounded hover:bg-[#1a2238] transition text-gray-300"
                        >
                          {copiedField === `all-${idx}` ? <><Check size={12} className="text-green-400"/> Copied</> : <><Copy size={12}/> Copy All</>}
                        </button>
                      </div>

                      {/* Machine Name */}
                      <div className="mb-3">
                        <p className="text-[10px] text-gray-500 uppercase mb-1">Machine Name</p>
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-semibold text-white break-all">{row.machineName}</p>
                          <button onClick={() => handleCopy(row.machineName, machineId)} className="text-gray-500 hover:text-white p-1">
                            {copiedField === machineId ? <Check size={14} className="text-green-400"/> : <Copy size={14}/>}
                          </button>
                        </div>
                      </div>

                      {/* Error Code */}
                      <div className="mb-3">
                        <p className="text-[10px] text-gray-500 uppercase mb-1">Error Code</p>
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-mono font-bold text-[#20E3FF] break-all">{row.errorCode}</p>
                          <button onClick={() => handleCopy(row.errorCode, codeId)} className="text-gray-500 hover:text-white p-1">
                            {copiedField === codeId ? <Check size={14} className="text-green-400"/> : <Copy size={14}/>}
                          </button>
                        </div>
                      </div>

                      {/* Error Fix */}
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase mb-1">Error Fix</p>
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm text-gray-300 break-all">{row.errorFix}</p>
                          <button onClick={() => handleCopy(row.errorFix, fixId)} className="text-gray-500 hover:text-white p-1">
                            {copiedField === fixId ? <Check size={14} className="text-green-400"/> : <Copy size={14}/>}
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
    <Suspense fallback={<div className="min-h-screen bg-[#0B1020] flex items-center justify-center text-white">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
