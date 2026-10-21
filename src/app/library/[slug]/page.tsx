"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { getLocalData } from "@/lib/local-db";
import { useSettings } from "@/lib/settings-context";

type VideoItem = { youtubeUrl: string; title: string | null; displayOrder: string };
type ArticleState = { title: string; body: string; summary: string | null; category: string | null; coverImageUrl: string | null; videos: VideoItem[]; galleryImages: string[]; };

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);
  return match ? match[1] : "";
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const { t } = useSettings();
  const [article, setArticle] = useState<ArticleState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocalData().then((data) => {
      if (data && data.articles && data.articleContents) {
        const found = (data.articles as Record<string, unknown>[]).find((a) => String(a.slug) === slug);
        if (found) {
          const contents = data.articleContents as Record<string, unknown>[];
          const content = contents.find((c) => c.articleId === found.id && c.locale === "my") || contents.find((c) => c.articleId === found.id);
          if (content) {
            const videos = ((data.mediaVideos as Record<string, unknown>[]) || [])
              .filter((v) => v.ownerType === "article" && v.ownerId === found.id)
              .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
              .map((v) => ({ youtubeUrl: String(v.youtubeUrl || ""), title: v.title ? String(v.title) : null, displayOrder: String(v.displayOrder || "0") }));

            // galleryImages ကို JSON string ကနေ parse လုပ်မယ်
            let parsedImages: string[] = [];
            if (found.galleryImages) {
              try {
                const parsed = JSON.parse(String(found.galleryImages));
                if (Array.isArray(parsed)) parsedImages = parsed;
              } catch {}
            }

            setArticle({
              title: String(content.title),
              body: String(content.body),
              summary: content.summary ? String(content.summary) : null,
              category: found.category ? String(found.category) : null,
              coverImageUrl: found.coverImageUrl ? String(found.coverImageUrl) : null,
              videos,
              galleryImages: parsedImages,
            });
          }
        }
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--nx-accent)] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!article) return <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex flex-col items-center justify-center p-4"><p className="text-[var(--nx-text-primary)] mb-4">{t("articleNotFound")}</p><button onClick={() => router.back()} className="px-4 py-2 bg-[var(--nx-bg-card)] text-[var(--nx-text-primary)] rounded-lg">{t("goBack")}</button></div>;

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <header className="sticky top-0 z-50 bg-[var(--nx-bg-base-deep)]/90 backdrop-blur-md border-b border-[var(--nx-border-updated)]">
        <div className="flex items-center gap-3 px-4 h-[var(--nx-top-nav-height)]">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-[var(--nx-text-primary)]" aria-label="Back">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-lg font-bold text-[var(--nx-text-primary)]">{t("library")}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 py-6">
        {article.coverImageUrl && <img src={article.coverImageUrl.startsWith("http") ? article.coverImageUrl : `${process.env.NEXT_PUBLIC_S3_URL}/${article.coverImageUrl}`} alt={article.title} className="w-full aspect-video object-cover rounded-xl mb-4 border border-[var(--nx-border-updated)]" />}
        {article.category && <span className="inline-block px-3 py-1 text-xs font-bold bg-[#176BFF] text-white rounded-full mb-3">{article.category}</span>}
        <h1 className="text-2xl font-bold text-[var(--nx-text-primary)] mb-4">{article.title}</h1>
        {article.summary && <p className="text-[var(--nx-text-secondary-updated)] mb-4 border-l-2 border-[#20E3FF] pl-3 italic">{article.summary}</p>}
        <div className="prose prose-invert max-w-none text-[var(--nx-text-secondary-updated)]" dangerouslySetInnerHTML={{ __html: article.body }} />
        {/* Gallery Images */}
        {article.galleryImages && article.galleryImages.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-[var(--nx-text-primary)] mb-3">📸 Images</h2>
            <div className="grid grid-cols-2 gap-3">
              {article.galleryImages.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-[var(--nx-border-updated)]">
                  <img 
                    src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_S3_URL}/${img}`} 
                    alt={`Gallery ${i + 1}`} 
                    className="w-full h-32 object-cover hover:scale-105 transition-transform duration-200" 
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {article.videos.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-[var(--nx-text-primary)] mb-3">🎬 {t("videos")}</h2>
            <div className="flex flex-col gap-4">
              {article.videos.map((v, i) => {
                const videoId = extractYouTubeId(v.youtubeUrl);
                if (!videoId) return null;
                return (
                  <div key={i}>
                    {v.title && <p className="text-sm text-[var(--nx-text-primary)] mb-2 font-medium">{v.title}</p>}
                    <iframe src={`https://www.youtube.com/embed/${videoId}`} title={v.title || `Video ${i + 1}`} className="w-full aspect-video rounded-xl border border-[var(--nx-border-updated)]" allowFullScreen loading="lazy" />
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
