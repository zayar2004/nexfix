"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { Machine3D } from "@/components/lab/Machine3D";
import type { ComponentId } from "@/components/lab/Machine3D";
import { LAB_COMPONENTS } from "@/lib/lab-components";
import { ArrowLeft, Box, Wrench, RotateCcw, X, Info } from "lucide-react";

type ViewMode = "exterior" | "interior" | "exploded";

export default function LabViewerPage() {
  const { t, locale } = useSettings();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("exterior");
  const [selectedComponent, setSelectedComponent] = useState<ComponentId>(null);

  const componentInfo = selectedComponent ? LAB_COMPONENTS[selectedComponent] : null;
  const isMyanmar = locale === "my";

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">3D Machine Viewer</h1>
            <p className="text-xs text-[var(--nx-text-muted-updated)]">Interactive training model</p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {[
            { id: "exterior", label: "Exterior", icon: Box },
            { id: "interior", label: "Interior", icon: Wrench },
            { id: "exploded", label: "Exploded", icon: RotateCcw },
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as ViewMode)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
                  viewMode === mode.id
                    ? "bg-[var(--nx-cyan)] text-black"
                    : "bg-[var(--nx-bg-card)] text-white border border-[var(--nx-border-updated)]"
                }`}
              >
                <Icon size={16} /> {mode.label}
              </button>
            );
          })}
        </div>

        {/* 3D Viewer */}
        <Machine3D
          viewMode={viewMode}
          selectedComponent={selectedComponent}
          onSelectComponent={setSelectedComponent}
        />

        {/* Hint */}
        <div className="mt-3 p-3 bg-[var(--nx-cyan)]/5 border border-[var(--nx-cyan)]/20 rounded-lg">
          <p className="text-xs text-[var(--nx-cyan)] flex items-center gap-1.5">
            <Info size={14} /> 
            {isMyanmar ? "အစိတ်အပိုင်းတစ်ခုကို နှိပ်ပြီး အသေးစိတ် လေ့လာပါ။ လှည့်ရန် ဆွဲပါ။" : "Tap a component to learn more. Drag to rotate."}
          </p>
        </div>

        {/* Component Info Panel */}
        {componentInfo && (
          <div className="mt-4 p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-cyan)] rounded-xl shadow-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-white">
                  {isMyanmar ? componentInfo.nameMy : componentInfo.nameEn}
                </h3>
                <span className="text-[10px] font-bold text-[var(--nx-cyan)] uppercase tracking-wide bg-[var(--nx-cyan)]/10 px-2 py-0.5 rounded border border-[var(--nx-cyan)]/30 inline-block mt-1">
                  {componentInfo.category}
                </span>
              </div>
              <button 
                onClick={() => setSelectedComponent(null)}
                className="p-1 text-[var(--nx-text-muted-updated)] hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-[var(--nx-text-secondary-updated)] leading-relaxed">
              {isMyanmar ? componentInfo.descriptionMy : componentInfo.descriptionEn}
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
