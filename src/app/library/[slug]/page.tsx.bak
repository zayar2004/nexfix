"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { getLocalData } from "@/lib/local-db";

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const [article, setArticle] = useState<{ title: string; body: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocalData().then(data => {
      if (data && data.articles && data.articleContents) {
        const found = (data.articles as Record<string, unknown>[]).find(a => String(a.slug) === slug);
        if (found) {
          const content = (data.articleContents as Record<string, unknown>[]).find(
            c => c.articleId === found.id && c.locale === "my"
          ) || (data.articleContents as Record<string, unknown>[]).find(
            c => c.articleId === found.id
          );
          if (content) {
            setArticle({ title: String(content.title), body: String(content.body) });
          }
        }
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--nx-accent)] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!article) return <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex flex-col items-center justify-center p-4"><p className="text-white mb-4">Article not found.</p><button onClick={() => router.back()} className="px-4 py-2 bg-[var(--nx-bg-card)] text-white rounded-lg">Go Back</button></div>;

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <header className="sticky top-0 z-50 bg-[var(--nx-bg-base-deep)]/90 backdrop-blur-md border-b border-[var(--nx-border-updated)]">
        <div className="flex items-center gap-3 px-4 h-[var(--nx-top-nav-height)]">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
          <h1 className="text-lg font-bold text-white">Article</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-4">{article.title}</h1>
        <div className="prose prose-invert max-w-none text-[var(--nx-text-secondary-updated)]" dangerouslySetInnerHTML={{ __html: article.body }} />
      </main>
      <BottomNav />
    </div>
  );
}
