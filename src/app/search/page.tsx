"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowLeft, Image as ImageIcon, Video } from "lucide-react";

type MediaItem = { id: string; url: string; mime: string };
type VideoItem = { id: string; url: string; title: string };
type SearchResult = {
  id: string;
  code: string;
  title: string;
  machineId: string;
  machineName: string;
  machineCode: string;
  media: MediaItem[];
  videos: VideoItem[];
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [machine, setMachine] = useState(searchParams.get("machine") || "");
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setSearched(true);
      try {
        const params = new URLSearchParams();
        if (machine) params.append("machine", machine);
        if (code) params.append("code", code);
        
        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        if (data.ok) {
          setResults(data.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (machine || code) {
        fetchResults();
      } else {
        setResults([]);
        setSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [machine, code]);

  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0B1020]/90 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 mb-4 hover:text-white transition">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-xl font-bold mb-4">Search Results</h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Machine name..." 
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                className="w-full bg-[#151B2E] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-[#176BFF] outline-none"
              />
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Error code (e.g., E-001)..." 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#151B2E] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-[#176BFF] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Searching...</div>
        ) : searched && results.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">No results found for "{machine} {code}"</p>
            <p className="text-sm text-gray-500 mt-2">Try different keywords or check the spelling.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {results.length > 0 && (
              <p className="text-sm text-gray-400 mb-2">{results.length} results found</p>
            )}
            {results.map((r) => (
              <div 
                key={r.id} 
                onClick={() => router.push(`/errors/${r.id}`)}
                className="bg-[#151B2E] border border-white/5 rounded-xl p-3 flex gap-4 cursor-pointer hover:border-[#176BFF]/50 transition group"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 flex-shrink-0 bg-[#0B1020] rounded-lg overflow-hidden flex items-center justify-center border border-white/5">
                  {r.media && r.media.length > 0 ? (
                    <img 
                      src={r.media[0].url} 
                      alt={r.machineName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <ImageIcon className="text-gray-600" size={24} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">{r.machineName}</p>
                      <h3 className="font-bold text-[#20E3FF] font-mono text-lg">{r.code}</h3>
                      <p className="text-sm text-gray-200 truncate">{r.title}</p>
                    </div>
                    <div className="flex gap-2">
                      {r.media && r.media.length > 0 && <span title="Has Images" className="text-gray-500"><ImageIcon size={14} /></span>}
                      {r.videos && r.videos.length > 0 && <span title="Has Videos" className="text-gray-500"><Video size={14} /></span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
