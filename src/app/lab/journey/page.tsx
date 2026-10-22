"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { ArrowLeft, Trophy, Star, Target, Zap, Award, TrendingUp } from "lucide-react";

export default function TechnicianJourneyPage() {
  const { locale } = useSettings();
  const router = useRouter();
  const isMyanmar = locale === "my";

  const levels = [
    { id: 1, nameEn: "Explorer", nameMy: "လေ့လာသူ", icon: Star, threshold: 0, descEn: "Learn the view modes", descMy: "မြင်ကွင်းမုဒ်များကို လေ့လာပါ" },
    { id: 2, nameEn: "Tester", nameMy: "စမ်းသပ်သူ", icon: Target, threshold: 3, descEn: "Complete 3 scenarios", descMy: "အခြေအနေ ၃ ခု ပြီးစီးပါ" },
    { id: 3, nameEn: "Troubleshooter", nameMy: "ပြဿနာဖြေရှင်းသူ", icon: Zap, threshold: 6, descEn: "Complete all 6 scenarios", descMy: "အခြေအနေ ၆ ခုလုံး ပြီးစီးပါ" },
    { id: 4, nameEn: "Master", nameMy: "ကျွမ်းကျင်သူ", icon: Trophy, threshold: 12, descEn: "Perfect score on all", descMy: "အားလုံးတွင် ပြည့်မှတ် ရယူပါ" },
  ];

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--nx-text-muted-updated)] mb-4">
          <ArrowLeft size={16} /> {isMyanmar ? "နောက်သို့" : "Back"}
        </button>

        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Trophy className="text-[var(--nx-warning)]" size={28} /> 
          {isMyanmar ? "နည်းပညာရှင် ခရီးစဉ်" : "Technician Journey"}
        </h1>
        <p className="text-sm text-[var(--nx-text-muted-updated)] mb-6">
          {isMyanmar ? "သင့်တိုးတက်မှုကို ကြည့်ရှုပါ" : "Track your learning progress"}
        </p>

        {/* Progress Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-center">
            <p className="text-2xl font-bold text-[var(--nx-cyan)]">0</p>
            <p className="text-[10px] text-[var(--nx-text-muted-updated)]">{isMyanmar ? "ပြီးစီး" : "Completed"}</p>
          </div>
          <div className="p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-center">
            <p className="text-2xl font-bold text-[var(--nx-success)]">0</p>
            <p className="text-[10px] text-[var(--nx-text-muted-updated)]">{isMyanmar ? "မှန်ကန်" : "Correct"}</p>
          </div>
          <div className="p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-center">
            <p className="text-2xl font-bold text-[var(--nx-warning)]">0</p>
            <p className="text-[10px] text-[var(--nx-text-muted-updated)]">{isMyanmar ? "ကြိုးစားမှု" : "Attempts"}</p>
          </div>
        </div>

        {/* Levels */}
        <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">Levels</h2>
        <div className="flex flex-col gap-2 mb-6">
          {levels.map((level, idx) => {
            const Icon = level.icon;
            return (
              <div key={level.id} className="flex items-center gap-3 p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-[var(--nx-cyan)]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-[var(--nx-cyan)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{isMyanmar ? level.nameMy : level.nameEn}</p>
                  <p className="text-[10px] text-[var(--nx-text-muted-updated)]">{isMyanmar ? level.descMy : level.descEn}</p>
                </div>
                <span className="text-xs font-bold text-[var(--nx-cyan)]">{level.threshold}+</span>
              </div>
            );
          })}
        </div>

        {/* Badges */}
        <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">Badges</h2>
        <div className="p-6 bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-center">
          <Award size={32} className="mx-auto text-[var(--nx-text-muted-updated)] opacity-30 mb-2" />
          <p className="text-xs text-[var(--nx-text-muted-updated)]">
            {isMyanmar ? "Badge များ ရယူရန် အခြေအနေများ ပြီးစီးပါ" : "Complete scenarios to earn badges"}
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
