"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { getLocalData } from "@/lib/local-db";
import { useSettings } from "@/lib/settings-context";
import { Search, BookOpen, ChevronRight, Activity, Monitor, AlertTriangle, Wrench, Video, Clock } from "lucide-react";

type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  coverImageUrl: string | null;
  updatedAt?: string | null;
};

export default function LibraryPage() {
  const { t } = useSettings();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getLocalData().then((data) => {
      if (data && data.articles && data.articleContents) {
        const contents = data.articleContents as Record<string, unknown>[];
        const items: Article[] = (data.articles as Record<string, unknown>[]).map((a) => {
          const content = contents.find((c) => c.articleId === a.id && c.locale === "my")
            || contents.find((c) => c.articleId === a.id);
          return {
            id: String(a.id),
            slug: String(a.slug),
            title: content ? String(content.title) : String(a.slug),
            summary: content?.summary ? String(content.summary) : null,
            category: a.category ? String(a.category) : null,
            coverImageUrl: a.coverImageUrl ? String(a.coverImageUrl) : null,
            updatedAt: a.updatedAt ? String(a.updatedAt) : null,
          };
        });
        setArticles(items);
      }
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    articles.forEach((a) => { if (a.category) cats.add(a.category); });
    return Array.from(cats).sort();
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (selectedCategory !== "all") {
      result = result.filter((a) => a.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => 
        a.title.toLowerCase().includes(q) || 
        (a.summary && a.summary.toLowerCase().includes(q))
      );
    }
    return result;
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const otherArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getCategoryIcon = (cat: string | null) => {
    if (!cat) return <BookOpen size={14} />;
    const c = cat.toLowerCase();
    if (c.includes("error")) return <AlertTriangle size={14} />;
    if (c.includes("repair") || c.includes("maintenance")) return <Wrench size={14} />;
    if (c.includes("video")) return <Video size={14} />;
    if (c.includes("machine")) return <Monitor size={14} />;
    return <BookOpen size={14} />;
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      
      <main className="max-w-3xl mx-auto pb-6">
        {/* Section A: Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-[var(--nx-text-primary)] mb-1 flex items-center gap-2">
            <BookOpen className="text-[var(--nx-cyan)]" size={24} /> Knowledge Library
          </h1>
          <p className="text-sm text-[var(--nx-text-muted-updated)]">Find solutions. Keep machines running.</p>
        </div>

        {/* Section B: Featured Banner */}
        <div className="px-4 mb-6">
          <div className="relative rounded-2xl overflow-hidden border border-[var(--nx-border-updated)] bg-[var(--nx-bg-card)] p-5 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--nx-cyan)] opacity-10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col gap-3">
              <span className="inline-block px-2.5 py-1 text-[10px] font-bold tracking-wider text-[var(--nx-cyan)] bg-[var(--nx-cyan)]/10 rounded-md w-fit border border-[var(--nx-cyan)]/20">
                TECHNICAL KNOWLEDGE
              </span>
              <h2 className="text-xl font-extrabold text-[var(--nx-text-primary)] leading-tight">
                Find Solutions.<br/>Keep Machines Running.
              </h2>
              <p className="text-xs text-[var(--nx-text-muted-updated)] leading-relaxed max-w-[85%]">
                Explore error codes, repair guides, machine manuals, and video tutorials.
              </p>
              <button 
                onClick={() => document.getElementById('article-list')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-1 w-fit px-4 py-2 bg-[var(--nx-cyan)] text-black text-xs font-bold rounded-lg hover:bg-[#06B6D4] transition flex items-center gap-1.5"
              >
                Explore Library <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Section C: Search Bar */}
        <div className="px-4 mb-5">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--nx-text-muted-updated)] group-focus-within:text-[var(--nx-cyan)] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search machines, error codes, solutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--nx-text-primary)] focus:border-[var(--nx-cyan)] focus:ring-1 focus:ring-[var(--nx-cyan)] outline-none transition-all"
            />
          </form>
        </div>

        {/* Section D: Category Filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-4 mb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                selectedCategory === "all"
                  ? "bg-[var(--nx-cyan)] text-black border-[var(--nx-cyan)]"
                  : "bg-[var(--nx-bg-card)] text-[var(--nx-text-muted-updated)] border-[var(--nx-border-updated)]"
              }`}
            >
              All ({articles.length})
            </button>
            {categories.map((cat) => {
              const count = articles.filter((a) => a.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? "bg-[var(--nx-cyan)] text-black border-[var(--nx-cyan)]"
                      : "bg-[var(--nx-bg-card)] text-[var(--nx-text-muted-updated)] border-[var(--nx-border-updated)]"
                  }`}
                >
                  {getCategoryIcon(cat)} {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Section E: Article List */}
        <div className="px-4" id="article-list">
          <div className="flex items-center justify-between mb-3 mt-2">
            <h3 className="text-sm font-bold text-[var(--nx-text-primary)] uppercase tracking-wide">
              {searchQuery ? "Search Results" : "Latest Articles"}
            </h3>
            <span className="text-xs text-[var(--nx-text-muted-updated)] flex items-center gap-1">
              <Activity size={12} /> {filteredArticles.length} items
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[var(--nx-cyan)] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)] text-sm">
              {articles.length === 0 
                ? "No articles available. Please sync data first." 
                : "No articles found for this search/category."}
            </div>
          ) : (
            <>
              {featuredArticle && (
                <Link href={`/library/${featuredArticle.slug}`} className="block mb-4">
                  <div className="relative rounded-2xl overflow-hidden bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] hover:border-[var(--nx-cyan)] transition-all group">
                    {featuredArticle.coverImageUrl ? (
                      <div className="relative h-48 w-full overflow-hidden">
                        <img 
                          src={featuredArticle.coverImageUrl.startsWith("http") ? featuredArticle.coverImageUrl : `${process.env.NEXT_PUBLIC_S3_URL}/${featuredArticle.coverImageUrl}`} 
                          alt={featuredArticle.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-[#0B1020]/50 to-transparent"></div>
                      </div>
                    ) : (
                      <div className="h-32 w-full bg-[var(--nx-bg-base-deep)] flex items-center justify-center">
                        <BookOpen size={40} className="text-[var(--nx-text-muted-updated)] opacity-20" />
                      </div>
                    )}
                    
                    <div className="p-4 relative z-10 -mt-8">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 text-[10px] font-bold bg-[var(--nx-cyan)] text-black rounded-md">
                          FEATURED
                        </span>
                        {featuredArticle.category && (
                          <span className="text-xs font-semibold text-[var(--nx-cyan)] flex items-center gap-1">
                            {getCategoryIcon(featuredArticle.category)} {featuredArticle.category}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-[var(--nx-text-primary)] mb-1 leading-snug">{featuredArticle.title}</h4>
                      {featuredArticle.summary && (
                        <p className="text-sm text-[var(--nx-text-muted-updated)] line-clamp-2">{featuredArticle.summary}</p>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {otherArticles.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {otherArticles.map((a) => (
                    <Link key={a.id} href={`/library/${a.slug}`}>
                      <div className="group flex flex-col h-full bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl overflow-hidden hover:border-[var(--nx-cyan)] transition-all duration-200">
                        {a.coverImageUrl ? (
                          <div className="h-28 w-full overflow-hidden">
                            <img 
                              src={a.coverImageUrl.startsWith("http") ? a.coverImageUrl : `${process.env.NEXT_PUBLIC_S3_URL}/${a.coverImageUrl}`} 
                              alt={a.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                            />
                          </div>
                        ) : (
                          <div className="h-28 w-full bg-[var(--nx-bg-base-deep)] flex items-center justify-center border-b border-[var(--nx-border-updated)]">
                            <BookOpen size={28} className="text-[var(--nx-text-muted-updated)] opacity-30" />
                          </div>
                        )}
                        
                        <div className="p-3 flex-1 flex flex-col">
                          {a.category && (
                            <span className="text-[10px] font-bold text-[var(--nx-cyan)] mb-1 flex items-center gap-1">
                              {getCategoryIcon(a.category)} {a.category}
                            </span>
                          )}
                          <p className="font-semibold text-[var(--nx-text-primary)] text-sm line-clamp-2 leading-snug">{a.title}</p>
                          {a.summary && (
                            <p className="text-[11px] text-[var(--nx-text-muted-updated)] line-clamp-2 mt-1">{a.summary}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
