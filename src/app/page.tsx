"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, ArrowRight } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeSearchClient } from "@/components/home/HomeSearchClient";
import { getLocalData, mergeLocalData, checkForUpdates } from "@/lib/local-db";
import { useSettings } from "@/lib/settings-context";

type RecentItem = { id: string; machineName: string; code: string; title: string; };
type ArticleItem = { id: string; slug: string; title: string; summary: string | null; category: string | null; };

function getAnnouncementFontSize(size?: string) {
  switch (size) {
    case "xs": return "text-[10px]";
    case "sm": return "text-xs";
    case "lg": return "text-base";
    case "xl": return "text-lg";
    default: return "text-sm";
  }
}

function AnnouncementBanner({ settings }: { settings: any }) {
  if (!settings?.announcementEnabled || !settings?.announcementText) return null;
  
  const content = settings.announcementLink ? (
    <a href={settings.announcementLink} className="hover:underline block w-full">
      {settings.announcementText}
    </a>
  ) : (
    settings.announcementText
  );

  return (
    <div 
      className={`px-4 py-2 text-center font-semibold ${getAnnouncementFontSize(settings.announcementFontSize)}`}
      style={{
        backgroundColor: settings.announcementBgColor || "#20E3FF",
        color: settings.announcementTextColor || "#000000",
      }}
    >
      {content}
    </div>
  );
}

export default function HomePage() {
  const { t, locale } = useSettings();
  const [heroData, setHeroData] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<RecentItem[]>([]);
  const [recentArticles, setRecentArticles] = useState<ArticleItem[]>([]);
  const [homeSettings, setHomeSettings] = useState<any>(null);
  const [stats, setStats] = useState<{ totalErrors: number; totalMachines: number; totalArticles: number }>({ totalErrors: 0, totalMachines: 0, totalArticles: 0 });
  const [loading, setLoading] = useState(true);

  // ၃ စက္ကန့်နောက် Hero Loading ကို အတင်းပိတ်မယ် (Data မရရင်)
  

  useEffect(() => {
    const loadData = async () => {
      if (navigator.onLine) {
        try {
          const res = await fetch("/api/sync");
          const data = await res.json();
          if (data.ok) await mergeLocalData(data.data);
        } catch (err) {
          console.log("Offline mode");
        }
      }

      const localData = await getLocalData();
      if (localData && localData.homepage) {
        const h = localData.homepage as any;
        setHomeSettings(h);

        let imageUrls: string[] | undefined = undefined;
        if (h.heroImages) {
          try {
            const parsed = JSON.parse(String(h.heroImages));
            if (Array.isArray(parsed) && parsed.length > 0) imageUrls = parsed;
          } catch {}
        }

        let config: any = {};
        if (h.heroConfig) {
          try { config = JSON.parse(String(h.heroConfig)); } catch {}
        }

        setHeroData({
          heading: h.heroHeading || "",
          description: h.heroDescription || "",
          imageUrl: h.heroImageUrl || "",
          imageUrls,
          config,
          showArcadeLabel: h.showArcadeLabel !== false,
          showHeroText: h.showHeroText !== false,
        });
      }

      if (localData && localData.stats) {
        setStats(localData.stats as any);
      } else if (localData) {
        setStats({
          totalErrors: (localData.errorCodes || []).length,
          totalMachines: (localData.machines || []).length,
          totalArticles: (localData.articles || []).length,
        });
      }

      if (localData && localData.articles && localData.articleContents) {
        const contents = localData.articleContents as any[];
        const articles = (localData.articles as any[]).slice(0, 3).map((a) => {
          const content = contents.find((c) => c.articleId === a.id && c.locale === "my") || contents.find((c) => c.articleId === a.id);
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

      const savedSearches = localStorage.getItem("nexfix_recent_searches");
      if (savedSearches) {
        try { setRecentSearches(JSON.parse(savedSearches)); } catch {}
      }

      // Loading ကို ဘာပဲဖြစ်ဖြစ် ပိတ်မယ်
    };

    loadData().catch((err) => {
      console.error("Home loadData failed:", err);
    });

    // ၃ စက္ကန့်အတွင်း အတင်းပိတ်မယ် (Safety)
    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timeout);
  
    // Background Sync — Network ပြန်ရတာနဲ့
    const handleOnline = () => {
      console.log("Network restored — syncing...");
      loadData();
    };
    window.addEventListener("online", handleOnline);

    // App Foreground — ပြန်ဖွင့်တာနဲ့
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        console.log("App foreground — checking updates...");
        loadData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };

}, [t]);

  const announcementPosition = homeSettings?.announcementPosition || "top";

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />

      {/* Announcement at Top */}
      {announcementPosition === "top" && <AnnouncementBanner settings={homeSettings} />}

      <main className="max-w-3xl mx-auto">
        <HeroSection data={heroData} />

        {/* Announcement at Middle (Below Hero) */}
        {announcementPosition === "middle" && <AnnouncementBanner settings={homeSettings} />}

        {homeSettings?.ctaEnabled && (
          <div className="px-4 py-3">
            <Link href={homeSettings.ctaLink || "/search"} className="block w-full py-3 bg-[var(--nx-accent)] text-black font-bold text-center rounded-lg hover:opacity-90 transition">
              {homeSettings.ctaText || "Get Started"}
            </Link>
          </div>
        )}

        <div className="px-4 py-5">
          <HomeSearchClient locale={locale} />

          {homeSettings?.showQuickStats && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[var(--nx-accent)]">{stats.totalErrors}</p>
                <p className="text-xs text-[var(--nx-text-muted-updated)]">Errors</p>
              </div>
              <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[var(--nx-accent)]">{stats.totalMachines}</p>
                <p className="text-xs text-[var(--nx-text-muted-updated)]">Machines</p>
              </div>
              <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[var(--nx-accent)]">{stats.totalArticles}</p>
                <p className="text-xs text-[var(--nx-text-muted-updated)]">Articles</p>
              </div>
            </div>
          )}

          {/* Knowledge Library Card */}
          <div className="mb-4">
            <Link 
              href="/library" 
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-[var(--nx-bg-card)] to-[var(--nx-cyan)]/5 border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-cyan)] transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--nx-cyan)]/10 flex items-center justify-center flex-shrink-0">
                <BookOpen size={24} className="text-[var(--nx-cyan)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--nx-text-primary)] text-sm mb-0.5 flex items-center gap-1.5">
                  Knowledge Library
                  <span className="text-[8px] font-bold text-black bg-[var(--nx-cyan)] px-1.5 py-0.5 rounded uppercase">NEW</span>
                </p>
                <p className="text-xs text-[var(--nx-text-muted-updated)]">Error codes, repair guides & tutorials</p>
              </div>
              <ChevronRight size={18} className="text-[var(--nx-text-muted-updated)] group-hover:text-[var(--nx-cyan)] transition flex-shrink-0" />
            </Link>
          </div>

          {homeSettings?.showRecentDiagnostics !== false && (
            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="nx-section-heading text-[var(--nx-text-primary)] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {t("recentDiagnostics")}
                </h2>
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
                        </div>
                        <p className="text-xs text-[var(--nx-text-secondary-updated)] mt-1 truncate">{item.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {homeSettings?.showRecentArticles !== false && recentArticles.length > 0 && (
            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="nx-section-heading text-[var(--nx-text-primary)] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                  Recent Articles
                </h2>
                <Link href="/library" className="text-xs text-[var(--nx-accent)] font-medium hover:underline">View All</Link>
              </div>
              <div className="flex flex-col gap-2">
                {recentArticles.map((a) => (
                  <Link key={a.id} href={`/library/${a.slug}`}>
                    <div className="p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-accent)] transition-colors">
                      {a.category && (
                        <span className="inline-block px-2 py-0.5 text-[9px] font-bold bg-[#176BFF] text-white rounded-full mb-1">{a.category}</span>
                      )}
                      <p className="font-semibold text-[var(--nx-text-primary)] text-sm truncate">{a.title}</p>
                      {a.summary && <p className="text-xs text-[var(--nx-text-secondary-updated)] mt-1 line-clamp-2">{a.summary}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Announcement at Bottom */}
      {announcementPosition === "bottom" && <AnnouncementBanner settings={homeSettings} />}

      <BottomNav />
    </div>
  );
}
