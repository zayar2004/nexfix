"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, CheckCircle, AlertCircle, ExternalLink, Type, Search } from "lucide-react";

export default function LibraryEditorPage() {
  const [locale, setLocale] = useState<"en" | "my">("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({
    pageTitle: "Knowledge Library",
    pageSubtitle: "Find solutions. Keep machines running.",
    heroLabel: "TECHNICAL KNOWLEDGE",
    heroTitle: "Find Solutions. Keep Machines Running.",
    heroDescription: "Explore error codes, repair guides, machine manuals, and video tutorials.",
    heroCtaText: "Explore Library",
    searchPlaceholder: "Search machines, error codes, solutions...",
    categoriesTitle: "Browse Categories",
    machineFilterTitle: "Filter by Machine",
    recentlyViewedTitle: "Recently Viewed",
    popularTitle: "Popular Resources",
  });

  const fetchConfig = async (loc: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/library-config?locale=${loc}`);
      const data = await res.json();
      if (data.ok && data.data) {
        setForm({
          pageTitle: data.data.pageTitle || "",
          pageSubtitle: data.data.pageSubtitle || "",
          heroLabel: data.data.heroLabel || "",
          heroTitle: data.data.heroTitle || "",
          heroDescription: data.data.heroDescription || "",
          heroCtaText: data.data.heroCtaText || "",
          searchPlaceholder: data.data.searchPlaceholder || "",
          categoriesTitle: data.data.categoriesTitle || "",
          machineFilterTitle: data.data.machineFilterTitle || "",
          recentlyViewedTitle: data.data.recentlyViewedTitle || "",
          popularTitle: data.data.popularTitle || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig(locale);
  }, [locale]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/library-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, ...form }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage({ text: "✅ Configuration saved!", type: "success" });
    } catch (err) {
      setMessage({ text: "❌ " + (err instanceof Error ? err.message : "Error"), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Library Page Editor">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Type className="text-[var(--nx-cyan)]" size={24} /> Library Page Editor
            </h1>
            <p className="text-xs text-[var(--nx-text-muted-updated)] mt-1">Library Page ရဲ့ စာသားတွေကို ဤနေရာမှ ပြင်နိုင်သည်</p>
          </div>
          <Link href="/library" target="_blank" className="px-4 py-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] text-white text-sm font-medium rounded-lg flex items-center gap-1.5 hover:border-[var(--nx-cyan)] transition">
            <ExternalLink size={16} /> View User Library
          </Link>
        </div>

        {/* Locale Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setLocale("en")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              locale === "en" ? "bg-[var(--nx-cyan)] text-black" : "bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)]"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLocale("my")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              locale === "my" ? "bg-[var(--nx-cyan)] text-black" : "bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)]"
            }`}
          >
            မြန်မာ
          </button>
        </div>

        {loading ? (
          <p className="text-center text-white py-10">Loading...</p>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {/* Section 1: Page Header */}
            <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-5">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Type size={16} className="text-[var(--nx-cyan)]" /> Page Header
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">Page Title</label>
                  <input type="text" value={form.pageTitle} onChange={(e) => setForm({ ...form, pageTitle: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">Page Subtitle</label>
                  <input type="text" value={form.pageSubtitle} onChange={(e) => setForm({ ...form, pageSubtitle: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
                </div>
              </div>
            </div>

            {/* Section 2: Hero Banner */}
            <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-5">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Type size={16} className="text-[var(--nx-cyan)]" /> Hero Banner
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">Hero Label</label>
                  <input type="text" value={form.heroLabel} onChange={(e) => setForm({ ...form, heroLabel: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">Hero Title</label>
                  <input type="text" value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">Hero Description</label>
                  <textarea value={form.heroDescription} onChange={(e) => setForm({ ...form, heroDescription: e.target.value })} rows={2} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">CTA Button Text</label>
                  <input type="text" value={form.heroCtaText} onChange={(e) => setForm({ ...form, heroCtaText: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
                </div>
              </div>
            </div>

            {/* Section 3: Search & Sections */}
            <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-5">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Search size={16} className="text-[var(--nx-cyan)]" /> Search & Section Titles
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">Search Placeholder</label>
                  <input type="text" value={form.searchPlaceholder} onChange={(e) => setForm({ ...form, searchPlaceholder: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">Categories Title</label>
                    <input type="text" value={form.categoriesTitle} onChange={(e) => setForm({ ...form, categoriesTitle: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">Machine Filter Title</label>
                    <input type="text" value={form.machineFilterTitle} onChange={(e) => setForm({ ...form, machineFilterTitle: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">Recently Viewed Title</label>
                    <input type="text" value={form.recentlyViewedTitle} onChange={(e) => setForm({ ...form, recentlyViewedTitle: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">Popular Resources Title</label>
                    <input type="text" value={form.popularTitle} onChange={(e) => setForm({ ...form, popularTitle: e.target.value })} className="w-full bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="sticky bottom-4 bg-[var(--nx-bg-base-deep)]/90 backdrop-blur p-3 rounded-xl border border-[var(--nx-border-updated)]">
              <button type="submit" disabled={saving} className="w-full py-3 bg-[var(--nx-cyan)] text-black font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={18} /> {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>

            {message && (
              <p className={`text-center text-sm p-3 rounded-lg flex items-center justify-center gap-2 ${message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </p>
            )}
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
