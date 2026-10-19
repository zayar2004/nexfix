"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { getLocalData } from "@/lib/local-db";
import { useSettings } from "@/lib/settings-context";

type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  coverImageUrl: string | null;
};

export default function LibraryPage() {
  const { t } = useSettings();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
          };
        });
        setArticles(items);
      }
      setLoading(false);
    });
  }, []);

  // 🌟 Category တွေကို စုစည်းမယ်
  const categories = useMemo(() => {
    const cats = new Set<string>();
    articles.forEach((a) => { if (a.category) cats.add(a.category); });
    return Array.from(cats).sort();
  }, [articles]);

  // 🌟 ရွေးထားတဲ့ Category အလိုက် စစ်မယ်
  const filteredArticles = useMemo(() => {
    if (selectedCategory === "all") return articles;
    return articles.filter((a) => a.category === selectedCategory);
  }, [articles, selectedCategory]);

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-6">
        <h1 className="text-2xl font-bold text-[var(--nx-text-primary)] mb-4">{t("knowledgeLibrary")}</h1>

        {/* 🌟 Category Filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === "all"
                  ? "bg-[var(--nx-accent)] text-black"
                  : "bg-[var(--nx-bg-card)] text-[var(--nx-text-muted-updated)] border border-[var(--nx-border-updated)]"
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
                  className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-[var(--nx-accent)] text-black"
                      : "bg-[var(--nx-bg-card)] text-[var(--nx-text-muted-updated)] border border-[var(--nx-border-updated)]"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[var(--nx-accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">
            {articles.length === 0 ? t("noArticles") : "No articles in this category."}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredArticles.map((a) => (
              <Link key={a.id} href={`/library/${a.slug}`}>
                <div className="flex gap-3 p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-accent)] transition-colors">
                  {a.coverImageUrl && (
                    <img src={a.coverImageUrl.startsWith("http") ? a.coverImageUrl : `${process.env.NEXT_PUBLIC_S3_URL}/${a.coverImageUrl}`} alt={a.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-[var(--nx-border-updated)]" />
                  )}
                  <div className="flex-1 min-w-0">
                    {a.category && (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-[#176BFF] text-white rounded-full mb-1">
                        {a.category}
                      </span>
                    )}
                    <p className="font-semibold text-[var(--nx-text-primary)] truncate">{a.title}</p>
                    {a.summary && (
                      <p className="text-sm text-[var(--nx-text-muted-updated)] line-clamp-2 mt-1">{a.summary}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
