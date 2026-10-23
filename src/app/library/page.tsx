"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { getLocalData, saveLocalData } from "@/lib/local-db";
import { useSettings } from "@/lib/settings-context";
import { 
  Search, BookOpen, ChevronRight, Monitor, AlertTriangle, Wrench, 
  Video, Bookmark, BookmarkCheck, Clock, Image as ImageIcon, 
  FileText, Flame, ArrowRight, Library, Activity, Eye} from "lucide-react";

type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  coverImageUrl: string | null;
  machineId?: string | null;
  heroImages?: string | null;
};

type Machine = {
  id: string;
  name: string;
  code: string | null;
  imageUrl: string | null;
};

export default function LibraryPage() {
  const { t } = useSettings();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMachine, setSelectedMachine] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [pageConfig, setPageConfig] = useState<any>(null);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Page ဝင်တာနဲ့ Auto Sync လုပ်မယ် (Reload မလုပ်ဘူး)
  useEffect(() => {
    const autoSync = async () => {
      if (!navigator.onLine) return;
      try {
        const res = await fetch("/api/sync");
        const data = await res.json();
        if (data.ok && data.data?.pendingApproval) {
          // Admin Approve မလုပ်ရသေးရင် Data မပြဘူး
          window.location.href = "/pending-approval";
          setLoading(false);
          return;
        }
        if (data.ok) {
          await saveLocalData(data.data);
          // Sync ပြီးရင် Data ကို ချက်ချင်း ပြန်ဖတ်မယ်
          const localData = await getLocalData();
          if (localData) {
            // Articles တွေ ပြန် set လုပ်မယ်
            if (localData.articles && localData.articleContents) {
              const contents = localData.articleContents as Record<string, unknown>[];
              const items = (localData.articles as Record<string, unknown>[]).map((a) => {
                const content = contents.find((c) => c.articleId === a.id && c.locale === "my")
                  || contents.find((c) => c.articleId === a.id);
                return {
                  id: String(a.id),
                  slug: String(a.slug),
                  title: content ? String(content.title) : String(a.slug),
                  summary: content?.summary ? String(content.summary) : null,
                  category: a.category ? String(a.category) : null,
                  coverImageUrl: a.coverImageUrl ? String(a.coverImageUrl) : null,
                  machineId: a.machineId ? String(a.machineId) : null,
                };
              });
              setArticles(items);
            }
            // Machines ပြန် set လုပ်မယ်
            if (localData.machines) {
              const machs = (localData.machines as Record<string, unknown>[]).map((m) => ({
                id: String(m.id),
                name: String(m.name),
                code: m.code ? String(m.code) : null,
                imageUrl: m.imageUrl ? String(m.imageUrl) : null,
              }));
              setMachines(machs);
            }
          }
        }
      } catch (e) {}
    };
    autoSync();
  }, []);

  useEffect(() => {
    getLocalData().then((data) => {
      if (data) {
        if (data.articles && data.articleContents) {
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
              machineId: a.machineId ? String(a.machineId) : null,
              heroImages: (a as any).heroImages ? String((a as any).heroImages) : null,
            };
          });
          setArticles(items);
        }
        if (data.machines) {
          const machs: Machine[] = (data.machines as Record<string, unknown>[]).map((m) => ({
            id: String(m.id),
            name: String(m.name),
            code: m.code ? String(m.code) : null,
            imageUrl: m.imageUrl ? String(m.imageUrl) : null,
          }));
          setMachines(machs);
        }
      }
      setLoading(false);
    });

    // Database ကနေ Recently Viewed ကို ယူမယ်
    fetch("/api/view-history")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data) {
          setRecentlyViewed(data.data);
        }
      })
      .catch(() => {});

    // Library Page Config ကို ယူမယ်
    fetch("/api/admin/library-config?locale=en")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data) {
          setPageConfig(data.data);
          if (data.data.heroImages) {
            try {
              const parsed = JSON.parse(String(data.data.heroImages));
              if (Array.isArray(parsed) && parsed.length > 0) {
                setHeroImages(parsed);
              }
            } catch {}
          }
        }
      })
      .catch(() => {});

    // View Count ကို ယူမယ်
    fetch("/api/view-history/count")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data) {
          const counts: Record<string, number> = {};
          data.data.forEach((d: any) => { counts[d.articleId] = Number(d.count); });
          setViewCounts(counts);
        }
      })
      .catch(() => {});

    fetch("/api/bookmarks")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data) {
          setBookmarkedIds(data.data.map((b: any) => b.articleId));
        }
      })
      .catch(() => {});
  }, []);

  // ၁၀ စက္ကန့်တစ်ခါ Hero Image ကို ပြောင်းမယ်
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [heroImages]);

  // Swipe အတွက် Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && heroImages.length > 1) {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }
    if (isRightSwipe && heroImages.length > 1) {
      setCurrentHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    }
    setTouchStart(null);
  };

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
    if (selectedMachine !== "all") {
      result = result.filter((a) => a.machineId === selectedMachine);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => 
        a.title.toLowerCase().includes(q) || 
        (a.summary && a.summary.toLowerCase().includes(q))
      );
    }
    return result;
  }, [articles, selectedCategory, selectedMachine, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleBookmark = async (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json();
      if (data.ok) {
        if (data.action === "added") {
          setBookmarkedIds((prev) => [...prev, articleId]);
        } else {
          setBookmarkedIds((prev) => prev.filter((id) => id !== articleId));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryIcon = (cat: string | null) => {
    if (!cat) return <BookOpen size={14} />;
    const c = cat.toLowerCase();
    if (c.includes("error")) return <AlertTriangle size={14} />;
    if (c.includes("repair") || c.includes("maintenance")) return <Wrench size={14} />;
    if (c.includes("video")) return <Video size={14} />;
    if (c.includes("machine")) return <Monitor size={14} />;
    if (c.includes("image") || c.includes("diagram")) return <ImageIcon size={14} />;
    if (c.includes("manual") || c.includes("document")) return <FileText size={14} />;
    return <BookOpen size={14} />;
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      
      <main className="max-w-3xl mx-auto pb-6">
        {/* Section A: Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-[var(--nx-text-primary)] mb-1 flex items-center gap-2">
            <Library className="text-[var(--nx-cyan)]" size={28} /> {pageConfig?.pageTitle || "Knowledge Library"}
          </h1>
          <p className="text-sm text-[var(--nx-text-muted-updated)]">{pageConfig?.pageSubtitle || "Find solutions. Keep machines running."}</p>
        </div>

                {/* Section B: Featured Banner (Carousel) */}
        <div className="px-4 mb-6">
          <div 
            className="relative rounded-2xl overflow-hidden border border-[var(--nx-border-updated)] shadow-xl h-[200px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background Image Carousel */}
            {heroImages.length > 0 ? (
              <>
                {heroImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      idx === currentHeroIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <img
                      src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_S3_URL}/${img}`}
                      alt={`Hero ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B1020]/95 via-[#0B1020]/70 to-transparent"></div>
                  </div>
                ))}
                
                {/* Carousel Dots */}
                {heroImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {heroImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentHeroIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentHeroIndex 
                            ? "w-6 bg-[var(--nx-cyan)]" 
                            : "w-1.5 bg-white/40"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Hero Images မရှိရင် Gradient ပဲ ပြမယ်
              <div className="absolute inset-0 bg-gradient-to-br from-[#0B1020] via-[#101F3D] to-[#0A1E4A]">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--nx-cyan)] opacity-20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              </div>
            )}

            {/* Text Content (Always on top) */}
            <div className="relative z-10 p-5 h-full flex flex-col justify-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[var(--nx-cyan)] bg-[var(--nx-cyan)]/10 rounded-md w-fit border border-[var(--nx-cyan)]/30 backdrop-blur-sm">
                <BookOpen size={10} /> TECHNICAL KNOWLEDGE
              </span>
              <h2 className="text-xl font-extrabold text-white leading-tight mt-2 drop-shadow-lg whitespace-pre-line">
                {pageConfig?.heroTitle || "Find Solutions. Keep Machines Running."}
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed max-w-[85%] mt-1 drop-shadow">
                {pageConfig?.heroDescription || "Explore error codes, repair guides, machine manuals, and video tutorials."}
              </p>
              <button 
                onClick={() => document.getElementById('article-list')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-2 w-fit px-4 py-2 bg-[var(--nx-cyan)] text-black text-xs font-bold rounded-lg hover:bg-[#06B6D4] transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/30"
              >
                {pageConfig?.heroCtaText || "Explore Library"} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Section C: Search Bar */}
        <div className="px-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nx-text-muted-updated)] group-focus-within:text-[var(--nx-cyan)] transition-colors" size={20} />
            <input
              type="text"
              placeholder={pageConfig?.searchPlaceholder || "Search machines, error codes, solutions..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl py-3.5 pl-12 pr-20 text-sm text-[var(--nx-text-primary)] focus:border-[var(--nx-cyan)] focus:ring-1 focus:ring-[var(--nx-cyan)] outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--nx-cyan)] text-black text-xs font-bold rounded-lg hover:opacity-90 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Section D: Category Cards (Grid) */}
        <div className="px-4 mb-6">
          <h3 className="text-sm font-bold text-[var(--nx-text-primary)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <Activity size={14} /> {pageConfig?.categoriesTitle || "Browse Categories"}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.length > 0 ? categories.map((cat) => {
              const count = articles.filter((a) => a.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "all" : cat)}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col gap-1.5 ${
                    selectedCategory === cat
                      ? "bg-[var(--nx-cyan)]/10 border-[var(--nx-cyan)] ring-1 ring-[var(--nx-cyan)]/30"
                      : "bg-[var(--nx-bg-card)] border-[var(--nx-border-updated)] hover:border-[var(--nx-cyan)]/50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedCategory === cat ? "bg-[var(--nx-cyan)]/20" : "bg-[var(--nx-cyan)]/10"
                  }`}>
                    <span className="text-[var(--nx-cyan)]">{getCategoryIcon(cat)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--nx-text-primary)] truncate">{cat}</p>
                    <p className="text-[10px] text-[var(--nx-text-muted-updated)]">{count} resources</p>
                  </div>
                  <ChevronRight size={12} className="text-[var(--nx-cyan)] self-end" />
                </button>
              );
            }) : (
              <div className="col-span-2 p-6 text-center text-[var(--nx-text-muted-updated)] text-xs border border-dashed border-[var(--nx-border-updated)] rounded-xl">
                No categories available
              </div>
            )}
          </div>
        </div>

        {/* Section E: Machine Filter */}
        {machines.length > 0 && (
          <div className="px-4 mb-6">
            <h3 className="text-sm font-bold text-[var(--nx-text-primary)] uppercase tracking-wide mb-3 flex items-center gap-2">
              <Monitor size={14} /> {pageConfig?.machineFilterTitle || "Filter by Machine"}
            </h3>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="w-full bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded-xl p-3 text-sm focus:border-[var(--nx-cyan)] outline-none"
            >
              <option value="all">All Machines ({articles.length})</option>
              {machines.map((m) => {
                const count = articles.filter((a) => a.machineId === m.id).length;
                return (
                  <option key={m.id} value={m.id}>{m.name} ({count})</option>
                );
              })}
            </select>
          </div>
        )}

        {/* Section F: Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-4 mb-3">
              <h3 className="text-sm font-bold text-[var(--nx-text-primary)] uppercase tracking-wide flex items-center gap-2">
                <Clock size={14} /> {pageConfig?.recentlyViewedTitle || "Recently Viewed"}
              </h3>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {recentlyViewed.map((r, idx) => (
                <Link key={idx} href={`/library/${r.slug}`}>
                  <div className="flex flex-col w-32 gap-2 group">
                    <div className="w-32 h-20 rounded-lg overflow-hidden bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)]">
                      {r.coverImageUrl ? (
                        <img 
                          src={r.coverImageUrl.startsWith("http") ? r.coverImageUrl : `${process.env.NEXT_PUBLIC_S3_URL}/${r.coverImageUrl}`} 
                          alt={r.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={20} className="text-[var(--nx-text-muted-updated)] opacity-30" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-[var(--nx-text-primary)] line-clamp-2 leading-tight">{r.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Section G: Popular Resources */}
        <div className="px-4" id="article-list">
          <div className="flex items-center justify-between mb-3 mt-2">
            <h3 className="text-sm font-bold text-[var(--nx-text-primary)] uppercase tracking-wide flex items-center gap-2">
              <Flame size={14} className="text-orange-400" /> 
              {searchQuery || selectedCategory !== "all" || selectedMachine !== "all" ? "Filtered Results" : (pageConfig?.popularTitle || "Popular Resources")}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--nx-text-muted-updated)]">
                {filteredArticles.length} items
              </span>
              {filteredArticles.length > 4 && (
                <Link href="/search" className="text-[10px] text-[var(--nx-cyan)] hover:underline font-bold">
                  View All →
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl animate-pulse">
                  <div className="w-24 h-24 rounded-lg bg-[var(--nx-bg-base-deep)]"></div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="h-3 w-16 bg-[var(--nx-bg-base-deep)] rounded mb-2"></div>
                      <div className="h-4 w-full bg-[var(--nx-bg-base-deep)] rounded mb-1"></div>
                      <div className="h-4 w-3/4 bg-[var(--nx-bg-base-deep)] rounded"></div>
                    </div>
                    <div className="h-3 w-1/2 bg-[var(--nx-bg-base-deep)] rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)] text-sm">
              No resources found. Try different filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredArticles.slice(0, 10).map((a) => (
                <Link key={a.id} href={`/library/${a.slug}`}>
                  <div className="group flex gap-3 p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-cyan)] transition-all">
                    {/* Thumbnail */}
                    {a.coverImageUrl ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--nx-border-updated)] relative">
                        <img 
                          src={a.coverImageUrl.startsWith("http") ? a.coverImageUrl : `${process.env.NEXT_PUBLIC_S3_URL}/${a.coverImageUrl}`} 
                          alt={a.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                        {a.category && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-bold text-white bg-black/70 rounded">
                            {a.category}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg flex-shrink-0 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] flex items-center justify-center">
                        <BookOpen size={24} className="text-[var(--nx-text-muted-updated)] opacity-30" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="font-bold text-[var(--nx-text-primary)] text-sm line-clamp-2 leading-snug mb-1">{a.title}</p>
                        {a.summary && (
                          <p className="text-[11px] text-[var(--nx-text-muted-updated)] line-clamp-2">{a.summary}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        {a.category && (
                          <span className="text-[10px] font-bold text-[var(--nx-cyan)] flex items-center gap-1">
                            {getCategoryIcon(a.category)} {a.category}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => toggleBookmark(e, a.id)} 
                            className="p-1.5 text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-cyan)] transition"
                          >
                            {bookmarkedIds.includes(a.id) ? (
                              <BookmarkCheck size={16} className="text-[var(--nx-cyan)]" />
                            ) : (
                              <Bookmark size={16} />
                            )}
                          </button>
                          {viewCounts[a.id] > 0 && (
                            <span className="text-[10px] text-[var(--nx-text-muted-updated)] flex items-center gap-0.5">
                              <Eye size={10} /> {viewCounts[a.id]}
                            </span>
                          )}
                          <ArrowRight size={14} className="text-[var(--nx-text-muted-updated)] group-hover:text-[var(--nx-cyan)] transition" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
