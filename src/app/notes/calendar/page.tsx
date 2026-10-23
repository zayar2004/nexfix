"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, List, Loader2, Clock } from "lucide-react";

type Note = {
  id: string;
  title: string;
  body: string | null;
  reminderAt: string | null;
  priority: string;
  isCompleted: boolean;
};

const MONTHS_MY = ["ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်", "ဇူလိုင်", "ဩဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_MY = ["တနင်္လာ", "အင်္ဂါ", "ဗုဒ္ဓဟူး", "ကြာသပတေး", "သောကြာ", "စနေ", "တနင်္ဂနွေ"];
const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const router = useRouter();
  const { t, locale } = useSettings();
  const isMyanmar = locale === "my";

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"month" | "list">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setNotes(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Calendar Grid တွက်မယ်
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // တနင်္လာနေ့ (Monday) ကနေ စမယ်
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const getNotesForDate = (date: Date) => {
    return notes.filter((n) => {
      if (!n.reminderAt) return false;
      const d = new Date(n.reminderAt);
      return d.toDateString() === date.toDateString();
    });
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };

  const days = getCalendarDays();
  const monthName = isMyanmar ? MONTHS_MY[currentDate.getMonth()] : MONTHS_EN[currentDate.getMonth()];
  const dayNames = isMyanmar ? DAYS_MY : DAYS_EN;
  const today = new Date();
  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isSelected = (d: Date) => selectedDate && d.toDateString() === selectedDate.toDateString();

  const selectedNotes = selectedDate ? getNotesForDate(selectedDate) : [];

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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-white">{isMyanmar ? "ပြက္ခဒိန်" : "Calendar"}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("month")}
              className={`p-2 rounded-lg ${viewMode === "month" ? "bg-[var(--nx-cyan)] text-black" : "bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)]"}`}
            >
              <Calendar size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[var(--nx-cyan)] text-black" : "bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)]"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4 p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
          <button onClick={prevMonth} className="p-2 text-white hover:bg-white/10 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToday} className="text-sm font-bold text-white">
            {monthName} {currentDate.getFullYear()}
          </button>
          <button onClick={nextMonth} className="p-2 text-white hover:bg-white/10 rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>

        {viewMode === "month" ? (
          <>
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-[var(--nx-text-muted-updated)] uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const dayNotes = getNotesForDate(day);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition relative ${
                      isSelected(day) ? "bg-[var(--nx-cyan)] text-black font-bold" :
                      isToday(day) ? "bg-[var(--nx-cyan)]/20 text-[var(--nx-cyan)] font-bold border border-[var(--nx-cyan)]/50" :
                      "text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{day.getDate()}</span>
                    {dayNotes.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayNotes.slice(0, 3).map((n, idx) => (
                          <div key={idx} className={`w-1 h-1 rounded-full ${n.isCompleted ? "bg-green-400" : "bg-red-400"}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Notes */}
            {selectedDate && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-white mb-2">
                  {selectedDate.toLocaleDateString(isMyanmar ? "my-MM" : "en-US", { weekday: "long", month: "short", day: "numeric" })}
                </h3>
                {selectedNotes.length === 0 ? (
                  <p className="text-xs text-[var(--nx-text-muted-updated)] text-center py-4">{isMyanmar ? "ဤရက်နေ့တွင် လုပ်ငန်း မရှိပါ" : "No tasks on this day"}</p>
                ) : (
                  <div className="space-y-2">
                    {selectedNotes.map((n) => (
                      <div key={n.id} onClick={() => router.push(`/notes/${n.id}`)} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg p-3 flex items-center gap-2 cursor-pointer">
                        <Clock size={14} className="text-[var(--nx-cyan)]" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${n.isCompleted ? "line-through text-slate-500" : "text-white"}`}>{n.title}</p>
                          {n.reminderAt && (
                            <p className="text-[10px] text-[var(--nx-text-muted-updated)]">
                              {new Date(n.reminderAt).toLocaleTimeString(isMyanmar ? "my-MM" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* List View */
          <div className="space-y-2">
            {notes
              .filter((n) => !n.isCompleted)
              .sort((a, b) => {
                if (!a.reminderAt) return 1;
                if (!b.reminderAt) return -1;
                return new Date(a.reminderAt).getTime() - new Date(b.reminderAt).getTime();
              })
              .map((n) => (
                <div key={n.id} onClick={() => router.push(`/notes/${n.id}`)} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg p-3 flex items-center gap-3 cursor-pointer">
                  <Clock size={16} className="text-[var(--nx-cyan)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{n.title}</p>
                    {n.reminderAt && (
                      <p className="text-[10px] text-[var(--nx-text-muted-updated)]">
                        {new Date(n.reminderAt).toLocaleString(isMyanmar ? "my-MM" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            {notes.filter((n) => !n.isCompleted).length === 0 && (
              <p className="text-xs text-[var(--nx-text-muted-updated)] text-center py-8">{isMyanmar ? "လုပ်ငန်း မရှိပါ" : "No tasks"}</p>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
