"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";

type MediaItem = { id: string; storageKey: string; mime: string; };

type HeroConfig = {
  fontSize: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  alignment: "left" | "center" | "right";
  position: "top" | "middle" | "bottom";
  textColor?: string;
};

export default function HomeConfigPage() {
  const [locale, setLocale] = useState<"my" | "en">("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    heroHeading: "Find Solutions\nKeep Machines Running",
    heroDescription: "Error codes, troubleshooting, and more for arcade technicians.",
    heroImages: [] as string[],
    isPublished: "draft",
    showRecentDiagnostics: true,
    showRecentArticles: true,
    showQuickStats: true,
    announcementText: "",
    announcementLink: "",
    announcementEnabled: false,
    ctaText: "Get Started",
    ctaLink: "/search",
    ctaEnabled: false,
  });

  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    fontSize: "md",
    alignment: "left",
    position: "bottom",
    textColor: "#FFFFFF",
  });

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const S3_URL = process.env.NEXT_PUBLIC_S3_URL || "";

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/home?locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.config) {
          let heroImages: string[] = [];
          if (data.config.heroImages) {
            try {
              const parsed = JSON.parse(data.config.heroImages);
              if (Array.isArray(parsed)) heroImages = parsed;
            } catch {}
          }
          if (heroImages.length === 0 && data.config.heroImageUrl) {
            heroImages = [data.config.heroImageUrl];
          }

          let config: HeroConfig = { fontSize: "md", alignment: "left", position: "bottom", textColor: "#FFFFFF" };
          if (data.config.heroConfig) {
            try { config = { ...config, ...JSON.parse(data.config.heroConfig) }; } catch {}
          }

          setForm({
            heroHeading: data.config.heroHeading || "Find Solutions\nKeep Machines Running",
            heroDescription: data.config.heroDescription || "Error codes, troubleshooting, and more for arcade technicians.",
            heroImages,
            isPublished: data.config.isPublished || "draft",
            showRecentDiagnostics: data.config.showRecentDiagnostics ?? true,
            showRecentArticles: data.config.showRecentArticles ?? true,
            showQuickStats: data.config.showQuickStats ?? true,
            announcementText: data.config.announcementText || "",
            announcementLink: data.config.announcementLink || "",
            announcementEnabled: data.config.announcementEnabled ?? false,
            ctaText: data.config.ctaText || "Get Started",
            ctaLink: data.config.ctaLink || "/search",
            ctaEnabled: data.config.ctaEnabled ?? false,
          });
          setHeroConfig(config);
        }
      })
      .finally(() => setLoading(false));
  }, [locale]);

  const handleSave = async (publish: boolean) => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          heroHeading: form.heroHeading,
          heroDescription: form.heroDescription,
          heroImageUrl: form.heroImages[0] || "",
          heroImages: form.heroImages,
          heroConfig,
          isPublished: publish ? "published" : "draft",
          showRecentDiagnostics: form.showRecentDiagnostics,
          showRecentArticles: form.showRecentArticles,
          showQuickStats: form.showQuickStats,
          announcementText: form.announcementText,
          announcementLink: form.announcementLink,
          announcementEnabled: form.announcementEnabled,
          ctaText: form.ctaText,
          ctaLink: form.ctaLink,
          ctaEnabled: form.ctaEnabled,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage(publish ? "✅ Published successfully!" : "💾 Saved as Draft");
    } catch (err) {
      setMessage("❌ Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setSaving(false);
    }
  };

  const openMediaPicker = async () => {
    setShowMediaPicker(true);
    setLoadingMedia(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.ok) setMediaItems(data.data);
    } catch {}
    setLoadingMedia(false);
  };

  const handleAddImage = (storageKey: string) => {
    const url = `${S3_URL}/${storageKey}`;
    if (!form.heroImages.includes(url)) setForm({ ...form, heroImages: [...form.heroImages, url] });
    setShowMediaPicker(false);
  };

  const handleAddCustomUrl = () => {
    if (!customUrl.trim()) return;
    if (form.heroImages.includes(customUrl.trim())) { alert("Already added"); return; }
    setForm({ ...form, heroImages: [...form.heroImages, customUrl.trim()] });
    setCustomUrl("");
    setShowMediaPicker(false);
  };

  const handleRemoveImage = (index: number) => {
    setForm({ ...form, heroImages: form.heroImages.filter((_, i) => i !== index) });
  };

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...form.heroImages];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    setForm({ ...form, heroImages: newImages });
  };

  if (loading) return <AdminLayout title="Home Page Editor"><div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[var(--nx-accent)] border-t-transparent rounded-full animate-spin"></div></div></AdminLayout>;

  return (
    <AdminLayout title="Home Page Editor">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setLocale("en")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${locale === "en" ? "bg-[var(--nx-accent)] text-black" : "bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)]"}`}>English</button>
          <button onClick={() => setLocale("my")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${locale === "my" ? "bg-[var(--nx-accent)] text-black" : "bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)]"}`}>မြန်မာ</button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Live Preview */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-3">Live Preview</h3>
            <div className="relative w-full h-[240px] rounded-xl overflow-hidden bg-[var(--nx-bg-base-deep)]">
              {form.heroImages[0] ? (
                <img src={form.heroImages[0]} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--nx-bg-surface-deep)] to-[var(--nx-bg-base-deep)]"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--nx-bg-base-deep)] via-[var(--nx-bg-base-deep)]/60 to-transparent"></div>
              <div className={`absolute inset-0 p-4 flex flex-col gap-2 ${
                heroConfig.position === "top" ? "justify-start pt-6" :
                heroConfig.position === "middle" ? "justify-center" : "justify-end pb-6"
              } ${
                heroConfig.alignment === "center" ? "items-center text-center" :
                heroConfig.alignment === "right" ? "items-end text-right" : "items-start text-left"
              }`}>
                <span className="text-[10px] font-bold text-[#20E3FF] uppercase tracking-widest">ARCADE DIAGNOSTICS</span>
                <h1 className={`font-black leading-tight whitespace-pre-line ${
                  heroConfig.fontSize === "xs" ? "text-lg" :
                  heroConfig.fontSize === "sm" ? "text-xl" :
                  heroConfig.fontSize === "lg" ? "text-3xl" :
                  heroConfig.fontSize === "xl" ? "text-4xl" :
                  heroConfig.fontSize === "2xl" ? "text-5xl" : "text-2xl"
                }`} style={{ color: heroConfig.textColor || "#FFFFFF" }}>
                  {form.heroHeading}
                </h1>
                <p className="text-xs" style={{ color: heroConfig.textColor || "#FFFFFF", opacity: 0.8 }}>
                  {form.heroDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Announcement Banner */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-3">Announcement Banner</h3>
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={form.announcementEnabled} onChange={(e) => setForm({ ...form, announcementEnabled: e.target.checked })} className="w-4 h-4" />
              <label className="text-sm text-white">Enable Announcement Banner</label>
            </div>
            <input type="text" placeholder="Announcement text (e.g., New features available!)" value={form.announcementText} onChange={(e) => setForm({ ...form, announcementText: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm mb-2" />
            <input type="text" placeholder="Announcement link (optional)" value={form.announcementLink} onChange={(e) => setForm({ ...form, announcementLink: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm" />
          </div>

          {/* Section Visibility */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-3">Section Visibility</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={form.showQuickStats} onChange={(e) => setForm({ ...form, showQuickStats: e.target.checked })} />
                Show Quick Stats
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={form.showRecentDiagnostics} onChange={(e) => setForm({ ...form, showRecentDiagnostics: e.target.checked })} />
                Show Recent Diagnostics
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={form.showRecentArticles} onChange={(e) => setForm({ ...form, showRecentArticles: e.target.checked })} />
                Show Recent Articles
              </label>
            </div>
          </div>

          {/* CTA Button */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-3">Call-to-Action Button</h3>
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={form.ctaEnabled} onChange={(e) => setForm({ ...form, ctaEnabled: e.target.checked })} className="w-4 h-4" />
              <label className="text-sm text-white">Enable CTA Button</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Button text (e.g., Get Started)" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm" />
              <input type="text" placeholder="Button link (e.g., /search)" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm" />
            </div>
          </div>

          {/* Text Style */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-3">Text Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--nx-text-muted-updated)] block mb-1">Font Size</label>
                <select value={heroConfig.fontSize} onChange={(e) => setHeroConfig({ ...heroConfig, fontSize: e.target.value as any })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm">
                  <option value="xs">Extra Small (XS)</option>
                  <option value="sm">Small (SM)</option>
                  <option value="md">Medium (MD)</option>
                  <option value="lg">Large (LG)</option>
                  <option value="xl">Extra Large (XL)</option>
                  <option value="2xl">2X Large (2XL)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--nx-text-muted-updated)] block mb-1">Text Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={heroConfig.textColor || "#FFFFFF"} onChange={(e) => setHeroConfig({ ...heroConfig, textColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                  <span className="text-xs text-[var(--nx-text-muted-updated)]">{heroConfig.textColor || "#FFFFFF"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button onClick={() => handleSave(false)} disabled={saving} className="flex-1 py-3 bg-[var(--nx-bg-surface-deep)] border border-[var(--nx-border-updated)] text-white font-bold rounded-lg disabled:opacity-50">
              {saving ? "Saving..." : "💾 Save as Draft"}
            </button>
            <button onClick={() => handleSave(true)} disabled={saving} className="flex-1 py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg disabled:opacity-50">
              {saving ? "Saving..." : "🚀 Publish"}
            </button>
          </div>
          {message && <p className="text-center text-sm p-2 rounded bg-[var(--nx-bg-surface-deep)]">{message}</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
