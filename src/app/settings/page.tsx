"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { clearLocalData, clearPrivateExcelData } from "@/lib/local-db";
import { useSettings } from "@/lib/settings-context";

export default function SettingsPage() {
  const router = useRouter();
  const { locale, theme, fontSize, setLocale, setTheme, setFontSize, t } = useSettings();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleLocaleChange = (lang: "my" | "en") => {
    setLocale(lang);
    showToast(lang === "my" ? "ဘာသာစကား ပြောင်းပြီးပါပြီ" : "Language changed!");
  };

  const handleThemeChange = (th: "dark" | "light") => {
    setTheme(th);
    showToast(t("themeChanged"));
  };

  const handleFontChange = (size: "normal" | "large") => {
    setFontSize(size);
    showToast(t("fontChanged"));
  };

  const handleClearSharedData = async () => {
    if (!confirm(t("clearSharedConfirm"))) return;
    await clearLocalData();
    showToast(t("dataCleared"));
    router.push("/");
  };

  const handleClearExcelData = async () => {
    if (!confirm(t("clearExcelConfirm"))) return;
    await clearPrivateExcelData();
    showToast(t("dataCleared"));
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav relative">
      
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] bg-[var(--nx-accent)] text-black font-bold px-6 py-2 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-6">
        
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-[var(--nx-text-primary)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl font-bold text-[var(--nx-text-primary)]">{t("settings")}</h1>
        </div>

        <div className="flex flex-col gap-4">
          {/* Language */}
          <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--nx-text-primary)] font-semibold text-sm">{t("language")}</p>
                <p className="text-xs text-[var(--nx-text-muted-updated)]">{t("appPreferences")}</p>
              </div>
              <div className="flex bg-[var(--nx-bg-base-deep)] rounded-lg p-1 border border-[var(--nx-border-updated)]">
                <button onClick={() => handleLocaleChange("en")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${locale === "en" ? "bg-[var(--nx-accent)] text-black" : "text-[var(--nx-text-muted-updated)]"}`}>EN</button>
                <button onClick={() => handleLocaleChange("my")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${locale === "my" ? "bg-[var(--nx-accent)] text-black" : "text-[var(--nx-text-muted-updated)]"}`}>MY</button>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--nx-text-primary)] font-semibold text-sm">{t("theme")}</p>
                <p className="text-xs text-[var(--nx-text-muted-updated)]">{t("darkMode")} / {t("lightMode")}</p>
              </div>
              <div className="flex bg-[var(--nx-bg-base-deep)] rounded-lg p-1 border border-[var(--nx-border-updated)]">
                <button onClick={() => handleThemeChange("dark")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${theme === "dark" ? "bg-[var(--nx-accent)] text-black" : "text-[var(--nx-text-muted-updated)]"}`}>{t("darkMode")}</button>
                <button onClick={() => handleThemeChange("light")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${theme === "light" ? "bg-[var(--nx-accent)] text-black" : "text-[var(--nx-text-muted-updated)]"}`}>{t("lightMode")}</button>
              </div>
            </div>
          </div>

          {/* Font Size */}
          <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--nx-text-primary)] font-semibold text-sm">{t("fontSize")}</p>
                <p className="text-xs text-[var(--nx-text-muted-updated)]">{t("fontSize")}</p>
              </div>
              <div className="flex bg-[var(--nx-bg-base-deep)] rounded-lg p-1 border border-[var(--nx-border-updated)]">
                <button onClick={() => handleFontChange("normal")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${fontSize === "normal" ? "bg-[var(--nx-accent)] text-black" : "text-[var(--nx-text-muted-updated)]"}`}>{t("normal")}</button>
                <button onClick={() => handleFontChange("large")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${fontSize === "large" ? "bg-[var(--nx-accent)] text-black" : "text-[var(--nx-text-muted-updated)]"}`}>{t("large")}</button>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
            <p className="text-[var(--nx-text-primary)] font-semibold text-sm mb-3">{t("dataStorage")}</p>
            <div className="flex flex-col gap-2">
              <button onClick={handleClearSharedData} className="w-full py-2.5 px-4 text-left text-sm bg-[var(--nx-bg-base-deep)] text-[var(--nx-warning)] border border-[var(--nx-warning)]/20 rounded-lg hover:bg-[var(--nx-warning)]/10 transition-colors font-medium">
                {t("clearSharedData")}
              </button>
              <button onClick={handleClearExcelData} className="w-full py-2.5 px-4 text-left text-sm bg-[var(--nx-bg-base-deep)] text-[var(--nx-error)] border border-[var(--nx-error)]/20 rounded-lg hover:bg-[var(--nx-error)]/10 transition-colors font-medium">
                {t("clearExcelData")}
              </button>
            </div>
          </div>

          {/* About */}
          <div className="p-6 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-center">
            <p className="text-3xl font-black italic mb-1"><span className="text-[var(--nx-text-primary)]">NEX</span><span className="text-[var(--nx-accent)]">FIX</span></p>
            <p className="text-sm font-bold text-[var(--nx-text-primary)]">{t("version")} 1.0.0</p>
            <p className="text-xs text-[var(--nx-text-muted-updated)] mt-2">Diagnose. Repair. Connect.</p>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
