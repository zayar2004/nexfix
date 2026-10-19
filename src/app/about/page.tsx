"use client";

import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";

export default function AboutPage() {
  const router = useRouter();
  const { t } = useSettings();

  const features = [
    { icon: "search", title: t("instantSearch"), desc: t("instantSearchDesc") },
    { icon: "offline", title: t("worksOffline"), desc: t("worksOfflineDesc") },
    { icon: "chat", title: t("communityChat"), desc: t("communityChatDesc") },
    { icon: "book", title: t("knowledgeLib"), desc: t("knowledgeLibDesc") },
  ];

  const icons: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></>,
    offline: <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
    chat: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
    book: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />,
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-[var(--nx-text-primary)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl font-bold text-[var(--nx-text-primary)]">{t("aboutNexfix")}</h1>
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--nx-accent)] to-[var(--nx-accent-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-3xl font-black italic text-black">NX</span>
          </div>
          <h2 className="text-2xl font-black italic mb-1"><span className="text-[var(--nx-text-primary)]">NEX</span><span className="text-[var(--nx-accent)]">FIX</span></h2>
          <p className="text-sm text-[var(--nx-text-muted-updated)]">{t("version")} 1.0.0</p>
          <p className="text-xs text-[var(--nx-text-muted-updated)] mt-2">Diagnose. Repair. Connect.</p>
        </div>

        <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl mb-6">
          <p className="text-sm text-[var(--nx-text-secondary-updated)] leading-relaxed">{t("aboutDesc")}</p>
        </div>

        <h3 className="text-sm font-bold text-[var(--nx-text-primary)] uppercase mb-3">{t("features")}</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {features.map((f) => (
            <div key={f.icon} className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[var(--nx-accent)]/10 flex items-center justify-center text-[var(--nx-accent)] mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[f.icon]}</svg>
              </div>
              <p className="font-semibold text-sm text-[var(--nx-text-primary)]">{f.title}</p>
              <p className="text-xs text-[var(--nx-text-muted-updated)] mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-center">
          <p className="text-xs text-[var(--nx-text-muted-updated)]">{t("madeWithLove")}</p>
          <p className="text-xs text-[var(--nx-text-muted-updated)] mt-1">{t("copyright")}</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
