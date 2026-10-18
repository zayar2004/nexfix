"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeConfigPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<"my" | "en">("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    heroHeading: "Find Solutions\nKeep Machines Running",
    heroDescription: "Error codes, troubleshooting, and more for arcade technicians.",
    heroImageUrl: "/images/arcade-hero.jpg",
    isPublished: "draft",
  });

  // Fetch existing config
  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/home?locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.config) {
          setForm({
            heroHeading: data.config.heroHeading,
            heroDescription: data.config.heroDescription,
            heroImageUrl: data.config.heroImageUrl,
            isPublished: data.config.isPublished,
          });
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
          ...form,
          isPublished: publish ? "published" : "draft",
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage(publish ? "✅ Published!" : "💾 Saved as Draft");
    } catch (err) {
      setMessage("❌ Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Home Page Editor</h1>
          <button onClick={() => router.push("/admin")} className="text-sm text-[var(--nx-accent)]">
            ← Back to Admin
          </button>
        </div>

        {/* Language Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setLocale("en")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${locale === "en" ? "bg-[var(--nx-accent)] text-black" : "bg-[var(--nx-bg-card)] text-white"}`}
          >
            English
          </button>
          <button
            onClick={() => setLocale("my")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${locale === "my" ? "bg-[var(--nx-accent)] text-black" : "bg-[var(--nx-bg-card)] text-white"}`}
          >
            မြန်မာ
          </button>
        </div>

        {loading ? (
          <p className="text-white">Loading...</p>
        ) : (
          <div className="flex flex-col gap-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-[var(--nx-text-muted-updated)]">Hero Heading</span>
              <textarea
                value={form.heroHeading}
                onChange={(e) => setForm({ ...form, heroHeading: e.target.value })}
                rows={2}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-[var(--nx-text-muted-updated)]">Hero Description</span>
              <textarea
                value={form.heroDescription}
                onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
                rows={2}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-[var(--nx-text-muted-updated)]">Hero Image URL</span>
              <input
                type="text"
                value={form.heroImageUrl}
                onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
                className="bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg p-2"
              />
            </label>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex-1 py-3 bg-[var(--nx-bg-elevated-deep)] text-white font-semibold rounded-lg"
              >
                {saving ? "..." : "Save Draft"}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex-1 py-3 bg-[var(--nx-accent)] text-black font-bold rounded-lg"
              >
                {saving ? "..." : "Publish"}
              </button>
            </div>

            {message && <p className="text-center text-sm text-[var(--nx-success)]">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
