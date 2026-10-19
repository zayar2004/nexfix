"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { getLocalData } from "@/lib/local-db";
import { useSettings } from "@/lib/settings-context";

type ErrorData = { id: string; code: string; title: string; machineName: string; machineCode: string; videoUrl?: string | null; };
type ContentData = { locale: string; cause: string | null; troubleshooting: string | null; solution: string | null; safety: string | null; notes: string | null; };
type VideoData = { id: string; youtubeUrl: string; title: string | null; };

function getYouTubeEmbedId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

export default function ErrorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { t, locale } = useSettings(); // 🌟 Language ကို Global ကနေ ယူမယ်
  
  const [activeTab, setActiveTab] = useState<"overview" | "cause" | "solution" | "media">("overview");
  const [data, setData] = useState<ErrorData | null>(null);
  const [content, setContent] = useState<ContentData | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const localData = await getLocalData();
        if (!localData) throw new Error("No local data. Please sync first.");

        const errorRecord = localData.errorCodes.find((e) => String(e.id) === id);
        if (!errorRecord) throw new Error("Error not found locally.");

        const machineRecord = localData.machines.find((m) => String(m.id) === String(errorRecord.machineId));

        const errorData = {
          id: String(errorRecord.id),
          code: String(errorRecord.code),
          title: String(errorRecord.title),
          machineName: String(machineRecord?.name || "Unknown"),
          machineCode: String(machineRecord?.code || "Unknown"),
          videoUrl: errorRecord.videoUrl ? String(errorRecord.videoUrl) : null,
        };
        setData(errorData);

        // Recent Searches ထဲကို သိမ်းမယ်
        const newItem = { id: errorData.id, machineName: errorData.machineName, code: errorData.code, title: errorData.title };
        const existing = JSON.parse(localStorage.getItem("nexfix_recent_searches") || "[]");
        const filtered = existing.filter((item: any) => item.id !== newItem.id);
        const updated = [newItem, ...filtered].slice(0, 10);
        localStorage.setItem("nexfix_recent_searches", JSON.stringify(updated));

        const contents = localData.errorContents.filter((c) => String(c.errorCodeId) === id);
        const myContent = contents.find((c) => c.locale === "my");
        const enContent = contents.find((c) => c.locale === "en");
        const selected = locale === "my" ? (myContent || enContent || null) : (enContent || myContent || null);

        setContent(selected ? {
          locale: String(selected.locale),
          cause: selected.cause ? String(selected.cause) : null,
          troubleshooting: selected.troubleshooting ? String(selected.troubleshooting) : null,
          solution: selected.solution ? String(selected.solution) : null,
          safety: selected.safety ? String(selected.safety) : null,
          notes: selected.notes ? String(selected.notes) : null,
        } : null);

        if (localData.mediaVideos) {
          const errorVideos = (localData.mediaVideos as Record<string, unknown>[]).filter(
            (v) => v.ownerType === "error" && String(v.ownerId) === id
          );
          setVideos(errorVideos.map((v) => ({
            id: String(v.id),
            youtubeUrl: String(v.youtubeUrl),
            title: v.title ? String(v.title) : null,
          })));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, locale]);

  if (loading) return <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--nx-accent)] border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !data) return <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex flex-col items-center justify-center p-4"><p className="text-[var(--nx-error)] mb-4">{error || t("errorNotFound")}</p><button onClick={() => router.back()} className="px-4 py-2 bg-[var(--nx-bg-card)] text-[var(--nx-text-primary)] rounded-lg">{t("goBack")}</button></div>;

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <header className="sticky top-0 z-50 bg-[var(--nx-bg-base-deep)]/90 backdrop-blur-md border-b border-[var(--nx-border-updated)]">
        <div className="flex items-center justify-between px-4 h-[var(--nx-top-nav-height)]">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-[var(--nx-text-primary)] hover:text-[var(--nx-accent)]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
            <h1 className="text-lg font-bold text-[var(--nx-text-primary)]">{t("errorDetail")}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        <div className="relative w-full h-[220px] bg-gradient-to-br from-[var(--nx-bg-surface-deep)] to-[var(--nx-bg-base-deep)] flex items-center justify-center overflow-hidden border-b border-[var(--nx-border-updated)]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--nx-accent)_0%,transparent_70%)]"></div>
          <div className="relative z-10 text-center px-4">
            <p className="text-sm font-medium text-[var(--nx-text-secondary-updated)]">{data.machineName}</p>
            <h2 className="text-5xl font-black text-[var(--nx-accent)] font-mono my-2">{data.code}</h2>
            <p className="text-lg font-semibold text-[var(--nx-text-primary)]">{data.title}</p>
          </div>
        </div>

        <div className="flex border-b border-[var(--nx-border-updated)] px-4 overflow-x-auto scrollbar-hide bg-[var(--nx-bg-base-deep)]">
          {(["overview", "cause", "solution", "media"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? "text-[var(--nx-accent)]" : "text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-text-primary)]"}`}>
              {t(tab)}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--nx-accent)]"></div>}
            </button>
          ))}
        </div>

        <div className="p-4 pb-48 flex flex-col gap-4">
          {activeTab === "overview" && (
            <>
              {content?.safety && (
                <div className="p-4 bg-[var(--nx-warning)]/10 border border-[var(--nx-warning)]/30 rounded-xl">
                  <h3 className="font-bold text-[var(--nx-warning)] mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    {t("safetyWarning")}
                  </h3>
                  <p className="text-sm text-[var(--nx-warning)]/90 whitespace-pre-wrap">{content.safety}</p>
                </div>
              )}
              
              {content?.notes && (
                <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                  <h3 className="font-semibold text-[var(--nx-text-primary)] mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    {t("technicianNotes")}
                  </h3>
                  <p className="text-sm text-[var(--nx-text-secondary-updated)] whitespace-pre-wrap leading-relaxed">{content.notes}</p>
                </div>
              )}

              {!content?.safety && !content?.notes && (
                <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">
                  {t("noResults")}
                </div>
              )}
            </>
          )}

          {activeTab === "cause" && (
            <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
              <h3 className="font-semibold text-[var(--nx-text-primary)] mb-2">{t("knownCauses")}</h3>
              <p className="text-sm text-[var(--nx-text-secondary-updated)] whitespace-pre-wrap leading-relaxed">{content?.cause || t("noResults")}</p>
            </div>
          )}

          {activeTab === "solution" && (
            <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-success)]/30 rounded-xl">
              <h3 className="font-semibold text-[var(--nx-success)] mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                {t("stepByStep")}
              </h3>
              <p className="text-sm text-[var(--nx-text-secondary-updated)] whitespace-pre-wrap leading-relaxed">{content?.solution || t("noResults")}</p>
            </div>
          )}

          {activeTab === "media" && (
            <div className="flex flex-col gap-4">
              {videos.length === 0 && !data.videoUrl && (
                <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">{t("noMedia")}</div>
              )}
              {videos.map((v) => {
                const videoId = getYouTubeEmbedId(v.youtubeUrl);
                if (!videoId) return null;
                return (
                  <div key={v.id} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl overflow-hidden">
                    <div className="aspect-video">
                      <iframe src={`https://www.youtube.com/embed/${videoId}`} title={v.title || "Video"} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                    {v.title && <p className="p-3 text-sm font-medium text-[var(--nx-text-primary)] border-t border-[var(--nx-border-updated)]">{v.title}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
