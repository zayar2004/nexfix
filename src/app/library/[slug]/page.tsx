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
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

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

            // 1. galleryImages ကို JSON string ကနေ parse လုပ်မယ်
            let parsedImages: string[] = [];
            if (found.galleryImages) {
              try {
                const parsed = JSON.parse(String(found.galleryImages));
                if (Array.isArray(parsed)) parsedImages = parsed;
              } catch {}
            }

            // 2. Sync ကလာတဲ့ articleMedia ထဲက ပုံတွေကိုပါ ပေါင်းထည့်မယ်
            const mediaData = (data as any).articleMedia || [];
            const mediaImages = mediaData
              .filter((m: any) => m.ownerId === found.id)
              .map((m: any) => m.url);
            
            // ပုံတွေ ထပ်မနေအောင် Set သုံးမယ်
            const allImages = Array.from(new Set([...parsedImages, ...mediaImages]));

            setArticle({
              title: String(content.title),
              body: String(content.body),
              summary: content.summary ? String(content.summary) : null,
              category: found.category ? String(found.category) : null,
              coverImageUrl: found.coverImageUrl ? String(found.coverImageUrl) : null,
              videos,
              galleryImages: allImages,
            });
          }
        }
      }
      setLoading(false);
    });
  }, [slug]);

  // Recently Viewed ကို LocalStorage ထဲ သိမ်းမယ်
  useEffect(() => {
    if (article && article.title) {
      try {
        const stored = localStorage.getItem("nexfix-recent-articles");
        let recent = stored ? JSON.parse(stored) : [];
        
        // အဟောင်းတွေကို ဖျက်မယ် (အများဆုံး ၁၀ ခုပဲ ထားမယ်)
        recent = recent.filter((item: any) => item.slug !== slug);
        
        // အသစ်ကို အပေါ်ဆုံးမှာ ထည့်မယ်
        recent.unshift({
          slug: slug,
          title: article.title,
          category: article.category,
          coverImageUrl: article.coverImageUrl,
          viewedAt: Date.now(),
        });
        
        if (recent.length > 10) recent = recent.slice(0, 10);
        
        localStorage.setItem("nexfix-recent-articles", JSON.stringify(recent));
      } catch (e) {
        console.error("Failed to save recent article", e);
      }
    }
  }, [article, slug]);

  const handleReportSubmit = async () => {
    if (!reportReason) return;
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article?.id || "",
          reason: reportReason,
          description: reportDesc,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setReportSubmitted(true);
        setTimeout(() => {
          setShowReport(false);
          setReportSubmitted(false);
          setReportReason("");
          setReportDesc("");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        {/* Report Button */}
        <div className="mt-12 mb-6 text-center border-t border-[var(--nx-border-updated)] pt-6">
          <button 
            onClick={() => setShowReport(true)}
            className="text-xs text-[var(--nx-text-muted-updated)] hover:text-red-400 underline transition"
          >
            Report Incorrect Information
          </button>
        </div>

        {/* Report Modal */}
        {showReport && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-md bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5 relative">
              <button onClick={() => setShowReport(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                <X size={20} />
              </button>
              
              {reportSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
                  <p className="text-white font-bold">Thank you!</p>
                  <p className="text-sm text-[var(--nx-text-muted-updated)]">Your report has been submitted.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-white mb-4">Report Article</h3>
                  <div className="flex flex-col gap-3">
                    <select 
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3"
                    >
                      <option value="">Select a reason...</option>
                      <option value="wrong_info">Incorrect troubleshooting information</option>
                      <option value="wrong_code">Wrong Error Code</option>
                      <option value="broken_media">Broken image/video</option>
                      <option value="outdated">Outdated manual</option>
                      <option value="safety">Safety concern</option>
                      <option value="other">Other issue</option>
                    </select>
                    <textarea 
                      placeholder="Optional description..."
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3"
                    />
                    <button 
                      onClick={handleReportSubmit}
                      disabled={!reportReason}
                      className="w-full py-3 bg-red-500 text-white font-bold rounded-lg disabled:opacity-50"
                    >
                      Submit Report
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
