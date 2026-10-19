"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeSearchClient } from "@/components/home/HomeSearchClient";
import { getLocalData, saveLocalData } from "@/lib/local-db";
import { useSettings } from "@/lib/settings-context";

type RecentItem = {
  id: string;
  machineName: string;
  code: string;
  title: string;
};

type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
};

export default function HomePage() {
  const { t, locale } = useSettings();
  const [heroData, setHeroData] = useState<{
    heading: string;
    description: string;
    imageUrl: string;
  } | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentItem[]>([]);
  const [recentArticles, setRecentArticles] = useState<ArticleItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      let localData = await getLocalData();
      if (!localData) {
        try {
          const res = await fetch("/api/sync");
          const data = await res.json();
          if (data.ok) {
            await saveLocalData(data.data);
            localData = data.data;
          }
        } catch (err) {
          console.log("Offline mode");
        }
      }

      // Hero Data
      if (localData && localData.homepage) {
        const h = localData.homepage as Record<string, unknown>;
        setHeroData({
          heading: String(h.heroHeading || t("findSolutions")),
          description: String(h.heroDescription || "Error codes, troubleshooting, and more for arcade technicians."),
          imageUrl: String(h.heroImageUrl || "/images/arcade-hero.jpg"),
        });
      } else {
        setHeroData({
          heading: t("findSolutions"),
          description: "Error codes, troubleshooting, and more for arcade technicians.",
          imageUrl: "/images/arcade-hero.jpg",
        });
      }

      // 🌟 Recent Articles (နောက်ဆုံး ၃ ခု)
      if (localData && localData.articles && localData.articleContents) {
        const contents = localData.articleContents as Record<string, unknown>[];
        const articles = (localData.articles as Record<string, unknown>[])
          .slice(0, 3)
          .map((a) => {
            const content = contents.find((c) => c.articleId === a.id && c.locale === "my") 
              || contents.find((c) => c.articleId === a.id);
            return {
              id: String(a.id),
              slug: String(a.slug),
              title: content ? String(content.title) : String(a.slug),
              summary: content?.summary ? String(content.summary) : null,
              category: a.category ? String(a.category) : null,
            };
          });
        setRecentArticles(articles);
      }

      // Recent Searches
      const savedSearches = localStorage.getItem("nexfix_recent_searches");
      if (savedSearches) {
        try {
          setRecentSearches(JSON.parse(savedSearches));
        } catch {}
      }
    };

    loadData();
  }, [t]);

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />

      <main className="max-w-3xl mx-auto">
        <HeroSection data={heroData} />

        <div className="px-4 py-5">
          <HomeSearchClient locale={locale} />

          {/* 🌟 Recent Diagnostics */}
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="nx-section-heading text-[var(--nx-text-primary)] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {t("recentDiagnostics")}
              </h2>
              {recentSearches.length > 0 && (
                <button 
                  onClick={() => {
                    localStorage.removeItem("nexfix_recent_searches");
                    setRecentSearches([]);
                  }}
                  className="text-xs text-[var(--nx-error)] font-medium hover:underline"
                >
                  {t("delete")}
                </button>
              )}
            </div>
            
            {recentSearches.length === 0 ? (
              <div className="text-center py-6 text-[var(--nx-text-muted-updated)] text-sm bg-[var(--nx-bg-card)] rounded-xl border border-dashed border-[var(--nx-border-updated)]">
                {t("noRecent")}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentSearches.slice(0, 5).map((item) => (
                  <Link key={item.id} href={`/errors/${item.id}`}>
                    <div className="p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-accent)] transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-[var(--nx-text-primary)] text-sm">{item.machineName}</span>
                          <span className="text-xs font-mono text-[var(--nx-accent)] ml-2">{item.code}</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nx-text-muted-updated)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                      <p className="text-xs text-[var(--nx-text-secondary-updated)] mt-1 truncate">{item.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 🌟 Recent Articles (Library Preview) */}
          {recentArticles.length > 0 && (
            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="nx-section-heading text-[var(--nx-text-primary)] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                  Recent Articles
                </h2>
                <Link href="/library" className="text-xs text-[var(--nx-accent)] font-medium hover:underline">
                  View All
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {recentArticles.map((a) => (
                  <Link key={a.id} href={`/library/${a.slug}`}>
                    <div className="p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-accent)] transition-colors">
                      {a.category && (
                        <span className="inline-block px-2 py-0.5 text-[9px] font-bold bg-[#176BFF] text-white rounded-full mb-1">
                          {a.category}
                        </span>
                      )}
                      <p className="font-semibold text-[var(--nx-text-primary)] text-sm truncate">{a.title}</p>
                      {a.summary && (
                        <p className="text-xs text-[var(--nx-text-secondary-updated)] mt-1 line-clamp-2">{a.summary}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
