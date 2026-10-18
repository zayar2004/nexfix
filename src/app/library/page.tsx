"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { getLocalData } from "@/lib/local-db";

type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  coverImageUrl: string | null;
};

export default function LibraryPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocalData().then((data) => {
      if (data && data.articles && data.articleContents) {
        const contents = data.articleContents as Record<string, unknown>[];
        const items: Article[] = (data.articles as Record<string, unknown>[]).map(
          (a) => {
            const content =
              contents.find(
                (c) => c.articleId === a.id && c.locale === "my"
              ) || contents.find((c) => c.articleId === a.id);

            return {
              id: String(a.id),
              slug: String(a.slug),
              title: content ? String(content.title) : String(a.slug),
              summary: content?.summary ? String(content.summary) : null,
              category: a.category ? String(a.category) : null,
              coverImageUrl: a.coverImageUrl ? String(a.coverImageUrl) : null,
            };
          }
        );
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
            {articles.map((a) => (
              <Link key={a.id} href={`/library/${a.slug}`}>
                <div className="flex gap-3 p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-accent)] transition-colors">
                  {a.coverImageUrl && (
                    <img
                      src={a.coverImageUrl}
                      alt={a.title}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-[var(--nx-border-updated)]"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {a.category && (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-[#176BFF] text-white rounded-full mb-1">
                        {a.category}
                      </span>
                    )}
                    <p className="font-semibold text-white truncate">
                      {a.title}
                    </p>
                    {a.summary && (
                      <p className="text-sm text-[var(--nx-text-muted-updated)] line-clamp-2 mt-1">
                        {a.summary}
                      </p>
                    )}
                    {!a.summary && (
                      <p className="text-sm text-[var(--nx-text-muted-updated)] truncate mt-1">
                        {a.slug}
                      </p>
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
