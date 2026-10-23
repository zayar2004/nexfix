"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { ArrowLeft, History, Loader2, Plus, CheckCircle, Clock, Pause, Play, SkipForward, Bell } from "lucide-react";

type HistoryItem = {
  id: string;
  action: string;
  createdAt: string;
  metadata?: any;
};

const ACTION_LABELS: Record<string, { my: string; en: string; icon: any; color: string }> = {
  created: { my: "ဖန်တီးခဲ့သည်", en: "Created", icon: Plus, color: "text-blue-400" },
  updated: { my: "ပြင်ဆင်ခဲ့သည်", en: "Updated", icon: Bell, color: "text-purple-400" },
  completed: { my: "ပြီးစီးခဲ့သည်", en: "Completed", icon: CheckCircle, color: "text-green-400" },
  snoozed: { my: "ရွှေ့ဆိုင်းခဲ့သည်", en: "Snoozed", icon: Clock, color: "text-amber-400" },
  paused: { my: "ခဏရပ်ခဲ့သည်", en: "Paused", icon: Pause, color: "text-slate-400" },
  resumed: { my: "ပြန်လုပ်ခဲ့သည်", en: "Resumed", icon: Play, color: "text-cyan-400" },
  skipped: { my: "ကျော်ခဲ့သည်", en: "Skipped", icon: SkipForward, color: "text-orange-400" },
  reminder_fired: { my: "သတိပေးချက် ပို့ခဲ့သည်", en: "Reminder Fired", icon: Bell, color: "text-amber-400" },
};

export default function TaskHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { locale } = useSettings();
  const isMyanmar = locale === "my";

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Note info
        const noteRes = await fetch(`/api/notes/${id}`);
        const noteData = await noteRes.json();
        if (noteData.ok) setNoteTitle(noteData.data.title);

        // History
        const histRes = await fetch(`/api/notes/${id}/history`);
        const histData = await histRes.json();
        if (histData.ok) setHistory(histData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
        <TopNav />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[var(--nx-cyan)] animate-spin" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{isMyanmar ? "သမိုင်းကြောင်း" : "History"}</h1>
            <p className="text-xs text-[var(--nx-text-muted-updated)]">{noteTitle}</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-[var(--nx-text-muted-updated)] mx-auto mb-3" />
            <p className="text-sm text-[var(--nx-text-muted-updated)]">{isMyanmar ? "သမိုင်းကြောင်း မရှိပါ" : "No history yet"}</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-2 bottom-2 w-px bg-white/10" />
            <div className="space-y-4">
              {history.map((item, idx) => {
                const label = ACTION_LABELS[item.action] || { my: item.action, en: item.action, icon: History, color: "text-white" };
                const Icon = label.icon;
                return (
                  <div key={item.id} className="flex gap-4 items-start relative">
                    <div className={`w-12 h-12 rounded-full bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] flex items-center justify-center flex-shrink-0 z-10`}>
                      <Icon size={18} className={label.color} />
                    </div>
                    <div className="flex-1 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-3">
                      <p className="text-sm font-medium text-white">
                        {isMyanmar ? label.my : label.en}
                      </p>
                      <p className="text-xs text-[var(--nx-text-muted-updated)] mt-1">
                        {new Date(item.createdAt).toLocaleString(isMyanmar ? "my-MM" : "en-US", {
                          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
