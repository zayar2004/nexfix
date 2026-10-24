"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { scheduleNotification, requestNotificationPermission } from "@/lib/notifications";
import { ArrowLeft, Clock, Bell, Repeat, AlertTriangle, Loader2, X, ImagePlus} from "lucide-react";

const INTERVALS = [1, 5, 10, 15, 30, 60];

function AddTaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const { t, locale } = useSettings();
  const isMyanmar = locale === "my";
  
  const [form, setForm] = useState(() => {
    let defaultInterval = 15;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexfix-reminder-settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          defaultInterval = parsed.defaultIntervalMinutes || 15;
        } catch {}
      }
    }
    return {
      title: "",
      body: "",
      priority: "normal" as "low" | "normal" | "high" | "urgent",
      reminderEnabled: true,
      reminderAt: "",
      reminderIntervalMinutes: defaultInterval,
      recurrence: "none" as "none" | "daily" | "weekly" | "monthly" | "yearly",
      imageUrls: [] as string[],
    };
  });
  const [customInterval, setCustomInterval] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(isEditMode);

  // Edit Mode ဖြစ်ရင် Data တွေ ဆွဲထုတ်မယ်
  useEffect(() => {
    if (!editId) return;

    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/notes/${editId}`);
        const data = await res.json();
        if (data.ok && data.data) {
          const n = data.data;
          setForm({
            title: n.title || "",
            body: n.body || "",
            priority: n.priority || "normal",
            reminderEnabled: n.reminderEnabled ?? true,
            // datetime-local format ပြောင်းဖို့ လိုတယ် (YYYY-MM-DDTHH:mm)
            reminderAt: n.reminderAt ? new Date(n.reminderAt).toISOString().slice(0, 16) : "",
            reminderIntervalMinutes: n.reminderIntervalMinutes || 15,
            recurrence: n.recurrence || "none",
            imageUrls: n.imageUrls || [],
          });
        } else {
          setError("Note not found");
        }
      } catch (err) {
        setError("Failed to load note");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [editId]);

  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.ok && data.url) newUrls.push(data.url);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...newUrls] }));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEditMode ? `/api/notes/${editId}` : "/api/notes";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          body: form.body || null,
          priority: form.priority,
          reminderEnabled: form.reminderEnabled,
          reminderAt: form.reminderAt ? new Date(form.reminderAt).toISOString() : null,
          reminderIntervalMinutes: form.reminderIntervalMinutes,
          recurrence: form.recurrence,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      
      // Notification ခွင့်ပြုချက် တောင်းမယ်
      await requestNotificationPermission();
      
      // Reminder ရှိရင် Notification သတ်မှတ်မယ်
      if (form.reminderEnabled && form.reminderAt) {
        const noteId = data.data?.id || editId;
        if (noteId) {
          await scheduleNotification(
            noteId,
            form.title,
            form.body || "NEXFIX Reminder",
            new Date(form.reminderAt),
            form.reminderIntervalMinutes
          );
        }
      }

      router.push("/notes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--nx-cyan)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">
            {isEditMode ? (isMyanmar ? "လုပ်ငန်း ပြင်ဆင်ရန်" : "Edit Task") : t("newTask")}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Images */}
          <div>
            <label className="block text-xs font-semibold text-[var(--nx-text-muted-updated)] mb-2 uppercase">{isMyanmar ? "ပုံများ" : "Images"}</label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <div className="grid grid-cols-3 gap-2">
              {form.imageUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--nx-border-updated)]">
                  <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-lg border-2 border-dashed border-[var(--nx-border-updated)] hover:border-[var(--nx-cyan)] transition flex flex-col items-center justify-center disabled:opacity-50"
              >
                {uploading ? <Loader2 size={24} className="text-[var(--nx-cyan)] animate-spin" /> : <ImagePlus size={24} className="text-[var(--nx-text-muted-updated)]" />}
                <span className="text-[10px] text-[var(--nx-text-muted-updated)] mt-1">{uploading ? "..." : "+"}</span>
              </button>
            </div>
            <p className="text-[10px] text-[var(--nx-text-muted-updated)] mt-1">{isMyanmar ? "ပုံများကို အကန့်အသတ်မရှိ ထည့်နိုင်သည်" : "Add unlimited images"}</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">{t("taskTitle")} *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={isMyanmar ? "လုပ်ငန်း ခေါင်းစဉ်" : "Task title"}
              className="w-full bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none"
              required
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">{t("taskDescription")}</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder={isMyanmar ? "အသေးစိတ်..." : "Description..."}
              rows={3}
              className="w-full bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-[var(--nx-text-muted-updated)] mb-2 uppercase">{t("priority")}</label>
            <div className="grid grid-cols-4 gap-2">
              {(["low", "normal", "high", "urgent"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p })}
                  className={`py-2 rounded-lg text-xs font-bold transition ${
                    form.priority === p
                      ? p === "urgent" ? "bg-red-500 text-white"
                        : p === "high" ? "bg-orange-500 text-white"
                        : p === "low" ? "bg-gray-500 text-white"
                        : "bg-blue-500 text-white"
                      : "bg-[var(--nx-bg-card)] text-[var(--nx-text-muted-updated)] border border-[var(--nx-border-updated)]"
                  }`}
                >
                  {t(p as any)}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Enabled */}
          <div className="flex items-center justify-between p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-[var(--nx-cyan)]" />
              <span className="text-sm text-white font-medium">{t("reminderEnabled")}</span>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, reminderEnabled: !form.reminderEnabled })}
              className={`w-12 h-6 rounded-full transition ${form.reminderEnabled ? "bg-[var(--nx-cyan)]" : "bg-gray-600"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.reminderEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {form.reminderEnabled && (
            <>
              {/* Reminder Time */}
              <div>
                <label className="block text-xs font-semibold text-[var(--nx-text-muted-updated)] mb-1 uppercase">{t("reminderTime")}</label>
                <input
                  type="datetime-local"
                  value={form.reminderAt}
                  onChange={(e) => setForm({ ...form, reminderAt: e.target.value })}
                  className="w-full bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none"
                />
              </div>

              {/* Interval */}
              <div>
                <label className="block text-xs font-semibold text-[var(--nx-text-muted-updated)] mb-2 uppercase">{t("reminderInterval")}</label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {INTERVALS.map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => { setForm({ ...form, reminderIntervalMinutes: min }); setCustomInterval(false); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                        !customInterval && form.reminderIntervalMinutes === min
                          ? "bg-[var(--nx-cyan)] text-black"
                          : "bg-[var(--nx-bg-card)] text-[var(--nx-text-muted-updated)] border border-[var(--nx-border-updated)]"
                      }`}
                    >
                      {min} {t("minutes")}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomInterval(true)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                      customInterval
                        ? "bg-[var(--nx-cyan)] text-black"
                        : "bg-[var(--nx-bg-card)] text-[var(--nx-text-muted-updated)] border border-[var(--nx-border-updated)]"
                    }`}
                  >
                    {isMyanmar ? "အခြား" : "Custom"}
                  </button>
                </div>
                {customInterval && (
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={form.reminderIntervalMinutes}
                    onChange={(e) => setForm({ ...form, reminderIntervalMinutes: Math.min(1440, Math.max(1, parseInt(e.target.value) || 15)) })}
                    className="mt-2 w-full bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none"
                    placeholder="1-1440 minutes"
                  />
                )}
              </div>

              {/* Recurrence */}
              <div>
                <label className="block text-xs font-semibold text-[var(--nx-text-muted-updated)] mb-2 uppercase flex items-center gap-1">
                  <Repeat size={12} /> {t("recurrence")}
                </label>
                <select
                  value={form.recurrence}
                  onChange={(e) => setForm({ ...form, recurrence: e.target.value as any })}
                  className="w-full bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)] rounded-lg p-3 text-sm focus:border-[var(--nx-cyan)] outline-none"
                >
                  <option value="none">{t("none")}</option>
                  <option value="daily">{t("daily")}</option>
                  <option value="weekly">{t("weekly")}</option>
                  <option value="monthly">{t("monthly")}</option>
                  <option value="yearly">{t("yearly")}</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[var(--nx-cyan)] text-black font-bold rounded-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isMyanmar ? (isEditMode ? "သိမ်းဆည်းမည်" : "ထည့်သွင်းမည်") : (isEditMode ? "Save Changes" : "Add Task")
            )}
          </button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}

// Next.js App Router မှာ useSearchParams ကို Suspense နဲ့ ခြုံရမယ်
export default function AddTaskPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--nx-bg-base-deep)]" />}>
      <AddTaskForm />
    </Suspense>
  );
}
