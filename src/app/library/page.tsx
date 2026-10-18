"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { getLocalData } from "@/lib/local-db";

type Article = { id: string; slug: string; title: string; locale: string };

export default function LibraryPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocalData().then(data => {
      if (data && data.articles && data.articleContents) {
        const items: Article[] = (data.articles as Record<string, unknown>[]).map((a) => {
          const content = (data.articleContents as Record<string, unknown>[]).find(
            (c) => c.articleId === a.id && c.locale === "my"
          ) || (data.articleContents as Record<string, unknown>[]).find(
            (c) => c.articleId === a.id
          );
          return {
            id: String(a.id),
            slug: String(a.slug),
            title: content ? String(content.title) : String(a.slug),
            locale: content ? String(content.locale) : "en",
          };
        });
        setArticles(items);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-4">Knowledge Library</h1>
        
        {loading ? (
          <p className="text-white">Loading...</p>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">
            No articles available. Please sync data first.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {articles.map(a => (
              <Link key={a.id} href={`/library/${a.slug}`}>
                <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-accent)] transition-colors">
                  <p className="font-semibold text-white">{a.title}</p>
                  <p className="text-sm text-[var(--nx-text-muted-updated)]">{a.slug}</p>
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
