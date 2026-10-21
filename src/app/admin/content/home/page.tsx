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

function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-[var(--nx-text-muted-updated)] mt-1 leading-relaxed border-l-2 border-[var(--nx-accent)]/30 pl-2">{children}</p>;
}

export default function HomeConfigPage() {
  const [locale, setLocale] = useState<"my" | "en">("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    heroHeading: "",
    heroDescription: "",
    heroImages: [] as string[],
    isPublished: "draft",
    showRecentDiagnostics: true,
    showRecentArticles: true,
    showQuickStats: true,
    announcementText: "",
    announcementLink: "",
    announcementEnabled: false,
    announcementFontSize: "sm",
    announcementTextColor: "#000000",
    announcementBgColor: "#20E3FF",
    announcementPosition: "top",
    showArcadeLabel: true,
    showHeroText: true,
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
              const parsed = JSON.parse(String(data.config.heroImages));
              if (Array.isArray(parsed)) heroImages = parsed;
            } catch {}
          }
          if (heroImages.length === 0 && data.config.heroImageUrl) {
            heroImages = [data.config.heroImageUrl];
          }

          let config: HeroConfig = { fontSize: "md", alignment: "left", position: "bottom", textColor: "#FFFFFF" };
          if (data.config.heroConfig) {
            try { config = { ...config, ...JSON.parse(String(data.config.heroConfig)) }; } catch {}
          }

          setForm({
            heroHeading: data.config.heroHeading || "",
            heroDescription: data.config.heroDescription || "",
            heroImages,
            isPublished: data.config.isPublished || "draft",
            showRecentDiagnostics: data.config.showRecentDiagnostics ?? true,
            showRecentArticles: data.config.showRecentArticles ?? true,
            showQuickStats: data.config.showQuickStats ?? true,
            announcementText: data.config.announcementText || "",
            announcementLink: data.config.announcementLink || "",
            announcementEnabled: data.config.announcementEnabled ?? false,
            announcementFontSize: data.config.announcementFontSize || "sm",
            announcementTextColor: data.config.announcementTextColor || "#000000",
            announcementBgColor: data.config.announcementBgColor || "#20E3FF",
            announcementPosition: data.config.announcementPosition || "top",
            showArcadeLabel: data.config.showArcadeLabel ?? true,
            showHeroText: data.config.showHeroText ?? true,
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
          announcementFontSize: form.announcementFontSize,
          announcementTextColor: form.announcementTextColor,
          announcementBgColor: form.announcementBgColor,
          announcementPosition: form.announcementPosition,
          showArcadeLabel: form.showArcadeLabel,
          showHeroText: form.showHeroText,
          ctaText: form.ctaText,
          ctaLink: form.ctaLink,
          ctaEnabled: form.ctaEnabled,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage(publish ? "✅ ထုတ်ဝေပြီးပါပြီ!" : "💾 မူကြမ်းအဖြစ် သိမ်းပြီးပါပြီ!");
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
        <div className="flex gap-2 mb-4 items-center flex-wrap">
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[var(--nx-bg-surface-deep)] border border-[var(--nx-border-updated)] text-white font-semibold rounded-lg hover:bg-[var(--nx-border-updated)] transition flex items-center gap-2 text-sm"
          >
            👁️ View User Home Page
          </a>
          <a
            href="/admin/content/library/editor"
            className="px-4 py-2 bg-[var(--nx-cyan)] text-black text-sm font-bold rounded-lg hover:opacity-90 transition flex items-center gap-2"
          >
            📚 Library Editor
          </a>
          <div className="w-px h-6 bg-[var(--nx-border-updated)] mx-1"></div>
          <button onClick={() => setLocale("en")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${locale === "en" ? "bg-[var(--nx-accent)] text-black" : "bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)]"}`}>English</button>
          <button onClick={() => setLocale("my")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${locale === "my" ? "bg-[var(--nx-accent)] text-black" : "bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)]"}`}>မြန်မာ</button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Hero Images */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-1">Hero Images (Carousel)</h3>
            <HelpText>ပုံများကို အများအပြား ထည့်သွင်းနိုင်ပါသည်။ Home Page တွင် ၁၀ စက္ကန့်တစ်ခါ အလိုအလျောက် ပြောင်းလဲသွားပါမည်။</HelpText>
            <div className="flex flex-col gap-2 mt-3 mb-3">
              {form.heroImages.length === 0 && <p className="text-xs text-[var(--nx-text-muted-updated)] italic">ပုံများ မထည့်ရသေးပါ။</p>}
              {form.heroImages.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] rounded-lg p-2">
                  <img src={url} alt="" className="w-12 h-12 rounded object-cover" />
                  <span className="flex-1 text-xs text-white truncate">{url}</span>
                  <button onClick={() => handleMoveImage(idx, "up")} disabled={idx === 0} className="text-xs px-2 py-1 bg-[var(--nx-bg-surface-deep)] text-white rounded disabled:opacity-30">↑</button>
                  <button onClick={() => handleMoveImage(idx, "down")} disabled={idx === form.heroImages.length - 1} className="text-xs px-2 py-1 bg-[var(--nx-bg-surface-deep)] text-white rounded disabled:opacity-30">↓</button>
                  <button onClick={() => handleRemoveImage(idx)} className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">✕</button>
                </div>
              ))}
            </div>
            <button onClick={openMediaPicker} className="w-full py-2 bg-[var(--nx-bg-surface-deep)] border border-[var(--nx-border-updated)] text-white text-sm font-medium rounded-lg hover:bg-[var(--nx-border-updated)]">
              + Media Library မှ ပုံထည့်ရန်
            </button>
          </div>

          {/* Hero Text */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-1">Hero Text</h3>
            <HelpText>Hero ပုံပေါ်တွင် ပြသမည့် ခေါင်းစဉ်နှင့် ဖော်ပြချက်။</HelpText>
            <div className="flex flex-col gap-2 mt-3">
              <label className="text-xs text-[var(--nx-text-muted-updated)]">Heading (ခေါင်းစဉ်)</label>
              <textarea value={form.heroHeading} onChange={(e) => setForm({ ...form, heroHeading: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm" rows={2} />
              <label className="text-xs text-[var(--nx-text-muted-updated)]">Description (ဖော်ပြချက်)</label>
              <textarea value={form.heroDescription} onChange={(e) => setForm({ ...form, heroDescription: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm" rows={2} />
            </div>
          </div>

          {/* Hero Text Visibility */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-1">Hero Text Visibility</h3>
            <HelpText>Hero ပုံပေါ်ရှိ စာသားအားလုံးကို ဖွင့်/ပိတ် လုပ်နိုင်သည်။</HelpText>
            <div className="flex flex-col gap-3 mt-3">
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={form.showHeroText} onChange={(e) => setForm({ ...form, showHeroText: e.target.checked })} />
                Hero စာသားအားလုံးကို ပြမည်
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={form.showArcadeLabel} onChange={(e) => setForm({ ...form, showArcadeLabel: e.target.checked })} />
                "ARCADE DIAGNOSTICS" စာတန်ကို ပြမည်
              </label>
            </div>
          </div>

          {/* Announcement */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-1">Announcement Banner</h3>
            <HelpText>Home Page တွင် ပြသမည့် ကြော်ငြာချက်။</HelpText>
            <div className="flex items-center gap-2 mb-3 mt-3">
              <input type="checkbox" checked={form.announcementEnabled} onChange={(e) => setForm({ ...form, announcementEnabled: e.target.checked })} className="w-4 h-4" />
              <label className="text-sm text-white">ကြော်ငြာချက် ဘန်နာ ဖွင့်မည်</label>
            </div>
            <input type="text" placeholder="ကြော်ငြာချက် စာသား" value={form.announcementText} onChange={(e) => setForm({ ...form, announcementText: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm mb-2" />
            <input type="text" placeholder="ကြော်ငြာချက် လင့်ခ် (Optional)" value={form.announcementLink} onChange={(e) => setForm({ ...form, announcementLink: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs text-[var(--nx-text-muted-updated)] block mb-1">Font Size</label>
                <select value={form.announcementFontSize} onChange={(e) => setForm({ ...form, announcementFontSize: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm">
                  <option value="xs">အလွန်သေး</option>
                  <option value="sm">သေး</option>
                  <option value="md">အလယ်</option>
                  <option value="lg">ကြီး</option>
                  <option value="xl">အလွန်ကြီး</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--nx-text-muted-updated)] block mb-1">Position</label>
                <select value={form.announcementPosition} onChange={(e) => setForm({ ...form, announcementPosition: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm">
                  <option value="top">ထိပ်ဆုံး</option>
                  <option value="middle">အလယ်</option>
                  <option value="bottom">အောက်ဆုံး</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--nx-text-muted-updated)] block mb-1">Text Color</label>
                <input type="color" value={form.announcementTextColor} onChange={(e) => setForm({ ...form, announcementTextColor: e.target.value })} className="w-full h-10 rounded cursor-pointer" />
              </div>
              <div>
                <label className="text-xs text-[var(--nx-text-muted-updated)] block mb-1">Background Color</label>
                <input type="color" value={form.announcementBgColor} onChange={(e) => setForm({ ...form, announcementBgColor: e.target.value })} className="w-full h-10 rounded cursor-pointer" />
              </div>
            </div>

            {form.announcementEnabled && form.announcementText && (
              <div className="mt-4">
                <p className="text-xs text-[var(--nx-text-muted-updated)] mb-1">Preview:</p>
                <div className={`px-4 py-2 text-center font-medium rounded`} style={{ backgroundColor: form.announcementBgColor, color: form.announcementTextColor, fontSize: form.announcementFontSize === "xs" ? "10px" : form.announcementFontSize === "sm" ? "12px" : form.announcementFontSize === "lg" ? "16px" : form.announcementFontSize === "xl" ? "18px" : "14px" }}>
                  {form.announcementText}
                </div>
              </div>
            )}
          </div>

          {/* Section Visibility */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-1">Section Visibility</h3>
            <HelpText>Home Page တွင် ဘယ်အပိုင်းတွေ ပြသမလဲ။</HelpText>
            <div className="flex flex-col gap-3 mt-3">
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={form.showQuickStats} onChange={(e) => setForm({ ...form, showQuickStats: e.target.checked })} />
                Quick Stats
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={form.showRecentDiagnostics} onChange={(e) => setForm({ ...form, showRecentDiagnostics: e.target.checked })} />
                Recent Diagnostics
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={form.showRecentArticles} onChange={(e) => setForm({ ...form, showRecentArticles: e.target.checked })} />
                Recent Articles
              </label>
            </div>
          </div>

          {/* Text Style */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-1">Text Style (စာသား ပုံစံ)</h3>
            <HelpText>ခေါင်းစဉ်၏ အရွယ်အစား၊ အရောင်နှင့် နေရာချထားမှုကို ရွေးချယ်ပါ။</HelpText>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="text-xs text-[var(--nx-text-muted-updated)] block mb-1">Font Size</label>
                <select value={heroConfig.fontSize} onChange={(e) => setHeroConfig({ ...heroConfig, fontSize: e.target.value as any })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm">
                  <option value="xs">အလွန်သေး (XS)</option>
                  <option value="sm">သေး (SM)</option>
                  <option value="md">အလယ်အလတ် (MD)</option>
                  <option value="lg">ကြီး (LG)</option>
                  <option value="xl">အလွန်ကြီး (XL)</option>
                  <option value="2xl">အလွန်ကြီး+ (2XL)</option>
                </select>
                <HelpText>ခေါင်းစဉ်၏ စာလုံးအရွယ်အစား။</HelpText>
              </div>
              <div>
                <label className="text-xs text-[var(--nx-text-muted-updated)] block mb-1">Alignment</label>
                <select value={heroConfig.alignment} onChange={(e) => setHeroConfig({ ...heroConfig, alignment: e.target.value as any })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm">
                  <option value="left">ဘယ်ဘက်</option>
                  <option value="center">အလယ်</option>
                  <option value="right">ညာဘက်</option>
                </select>
                <HelpText>စာသားကို ဘယ်/ညာ/အလယ် ဘယ်လိုချထားမလဲ။</HelpText>
              </div>
              <div>
                <label className="text-xs text-[var(--nx-text-muted-updated)] block mb-1">Vertical Position</label>
                <select value={heroConfig.position} onChange={(e) => setHeroConfig({ ...heroConfig, position: e.target.value as any })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm">
                  <option value="top">အပေါ်</option>
                  <option value="middle">အလယ်</option>
                  <option value="bottom">အောက်</option>
                </select>
                <HelpText>စာသားကို အပေါ်/အောက် ဘယ်လိုချထားမလဲ။</HelpText>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-[var(--nx-text-muted-updated)] block mb-1">Text Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={heroConfig.textColor || "#FFFFFF"} onChange={(e) => setHeroConfig({ ...heroConfig, textColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                <span className="text-xs text-[var(--nx-text-muted-updated)]">{heroConfig.textColor || "#FFFFFF"}</span>
              </div>
              <HelpText>ခေါင်းစဉ်၏ စာသားအရောင်။ နောက်ခံမှောင်ရင် အဖြူရောင် သုံးပါ။</HelpText>
            </div>
          </div>

          {/* CTA Button */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-1">Call-to-Action Button</h3>
            <div className="flex items-center gap-2 mb-3 mt-3">
              <input type="checkbox" checked={form.ctaEnabled} onChange={(e) => setForm({ ...form, ctaEnabled: e.target.checked })} className="w-4 h-4" />
              <label className="text-sm text-white">CTA ခလုတ် ဖွင့်မည်</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="ခလုတ် စာသား" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm" />
              <input type="text" placeholder="ခလုတ် လင့်ခ်" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button onClick={() => handleSave(false)} disabled={saving} className="flex-1 py-3 bg-[var(--nx-bg-surface-deep)] border border-[var(--nx-border-updated)] text-white font-bold rounded-lg disabled:opacity-50">
              {saving ? "သိမ်းဆည်းနေသည်..." : "💾 မူကြမ်းအဖြစ် သိမ်းရန်"}
            </button>
            <button onClick={() => handleSave(true)} disabled={saving} className="flex-1 py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg disabled:opacity-50">
              {saving ? "သိမ်းဆည်းနေသည်..." : "🚀 ထုတ်ဝေရန် (Publish)"}
            </button>
          </div>
          {message && <p className="text-center text-sm p-2 rounded bg-[var(--nx-bg-surface-deep)]">{message}</p>}
        </div>
      </div>

      {showMediaPicker && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--nx-bg-card)] rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--nx-border-updated)] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">ပုံ ရွေးချယ်ပါ</h3>
              <button onClick={() => setShowMediaPicker(false)} className="text-white/60 hover:text-white text-2xl">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="mb-4">
                <label className="text-xs text-[var(--nx-text-muted-updated)] block mb-1">သို့မဟုတ် ကိုယ်ပိုင် URL ထည့်ပါ:</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="https://..." value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} className="flex-1 bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2 text-sm" />
                  <button onClick={handleAddCustomUrl} className="px-4 py-2 bg-[var(--nx-accent)] text-black font-bold rounded-lg text-sm">ထည့်ရန်</button>
                </div>
              </div>
              {loadingMedia ? (
                <p className="text-white text-center py-8">ဖွင့်နေသည်...</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {mediaItems.map(m => (
                    <button key={m.id} onClick={() => handleAddImage(m.storageKey)} className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[var(--nx-accent)] transition">
                      <img src={`${S3_URL}/${m.storageKey}`} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
